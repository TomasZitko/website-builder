import { stripe } from '../config/stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export async function createCheckoutSession(
  userId: string,
  websiteId: string,
  successUrl: string,
  cancelUrl: string
) {
  try {
    // Get user email
    const { data: user } = await supabase
      .from('users')
      .select('email, stripe_customer_id')
      .eq('id', userId)
      .single();

    if (!user) throw new Error('User not found');

    // Get website details
    const { data: website } = await supabase
      .from('websites')
      .select('name, is_paid')
      .eq('id', websiteId)
      .eq('user_id', userId)
      .single();

    if (!website) throw new Error('Website not found');
    if (website.is_paid) throw new Error('Website already paid for');

    // Create or get Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId
        }
      });
      customerId = customer.id;

      // Save customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Website: ${website.name}`,
              description: 'One-time purchase - Download your website as ZIP'
            },
            unit_amount: 799 // ¬7.99 in cents
          },
          quantity: 1
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        websiteId
      }
    });

    // Create payment record
    await supabase
      .from('payments')
      .insert({
        user_id: userId,
        website_id: websiteId,
        stripe_payment_intent_id: session.payment_intent as string,
        amount: 7.99,
        currency: 'EUR',
        payment_type: 'one-time',
        status: 'pending',
        metadata: {
          session_id: session.id
        }
      });

    return {
      sessionId: session.id,
      url: session.url
    };
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    throw error;
  }
}

export async function handleWebhookEvent(
  signature: string,
  rawBody: string
) {
  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
    }

    return { received: true };
  } catch (error: any) {
    console.error('Webhook error:', error);
    throw error;
  }
}

async function handleCheckoutCompleted(session: any) {
  const { userId, websiteId } = session.metadata;

  // Mark website as paid
  await supabase
    .from('websites')
    .update({
      is_paid: true,
      paid_at: new Date().toISOString(),
      payment_amount: 7.99
    })
    .eq('id', websiteId);

  // Update payment record
  await supabase
    .from('payments')
    .update({
      status: 'succeeded',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', session.payment_intent);

  console.log(` Payment completed for website ${websiteId}`);
}

async function handlePaymentSucceeded(paymentIntent: any) {
  await supabase
    .from('payments')
    .update({
      status: 'succeeded',
      stripe_charge_id: paymentIntent.charges.data[0]?.id,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  console.log(` Payment succeeded: ${paymentIntent.id}`);
}

async function handlePaymentFailed(paymentIntent: any) {
  await supabase
    .from('payments')
    .update({
      status: 'failed',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  console.log(`L Payment failed: ${paymentIntent.id}`);
}

export async function getPaymentHistory(userId: string) {
  const { data: payments, error } = await supabase
    .from('payments')
    .select(`
      id,
      amount,
      currency,
      status,
      payment_type,
      created_at,
      websites (
        id,
        name
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return payments || [];
}
