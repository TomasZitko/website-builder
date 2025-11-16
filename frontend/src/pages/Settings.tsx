/**
 * Comprehensive Settings Page
 * Account, Subscription, Billing, White-label, Domains
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { TopNav } from '../components/builder/TopNav';
import {
  User, CreditCard, Building, Globe, Palette, Settings as SettingsIcon,
  Save, Upload, Check, Crown, Zap, Shield
} from 'lucide-react';

type TabType = 'account' | 'subscription' | 'billing' | 'branding' | 'domains';

export default function Settings() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('account');

  // Account type - would come from user object
  const accountType = user?.subscriptionTier || 'free';
  const isFreelancer = accountType === 'freelancer';
  const isAgency = accountType === 'agency';
  const isDeveloper = isFreelancer || isAgency;

  const tabs = [
    { id: 'account' as TabType, name: 'Account', icon: User },
    { id: 'subscription' as TabType, name: 'Subscription', icon: Crown },
    { id: 'billing' as TabType, name: 'Billing', icon: CreditCard },
    ...(isDeveloper ? [
      { id: 'branding' as TabType, name: 'White Label', icon: Palette },
      { id: 'domains' as TabType, name: 'Domains', icon: Globe }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <nav className="flex flex-col">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-6 py-4 text-left transition ${
                      activeTab === tab.id
                        ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600'
                        : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Current Plan Badge */}
            <div className="mt-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5" />
                <span className="text-sm font-medium opacity-90">Current Plan</span>
              </div>
              <p className="text-2xl font-bold capitalize">{accountType}</p>
              {accountType === 'free' && (
                <button
                  onClick={() => navigate('/')}
                  className="mt-4 w-full px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition font-medium text-sm"
                >
                  Upgrade Now
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              {activeTab === 'account' && <AccountTab />}
              {activeTab === 'subscription' && <SubscriptionTab accountType={accountType} />}
              {activeTab === 'billing' && <BillingTab />}
              {activeTab === 'branding' && isDeveloper && <BrandingTab />}
              {activeTab === 'domains' && isDeveloper && <DomainsTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Account Tab
function AccountTab() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const handleSave = async () => {
    // Save via API
    console.log('Saving:', formData);
    setIsEditing(false);
    // TODO: Call API to update user
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Account Information</h2>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            disabled={!isEditing}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        <div className="flex gap-3 pt-4">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Edit Information
            </button>
          )}
        </div>

        {/* Password Change */}
        <div className="pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Change Password</h3>
          <div className="space-y-4 max-w-md">
            <input
              type="password"
              placeholder="Current Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              placeholder="New Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subscription Tab
function SubscriptionTab({ accountType }: { accountType: string }) {
  const plans = [
    {
      name: 'Personal',
      price: 29,
      current: accountType === 'personal',
      features: ['10 websites', '50 AI generations/month', 'Custom domains', 'Analytics']
    },
    {
      name: 'Freelancer',
      price: 99,
      current: accountType === 'freelancer',
      features: ['50 websites', '20 clients', '200 AI generations', 'Portfolio generator', 'White-label']
    },
    {
      name: 'Agency',
      price: 299,
      current: accountType === 'agency',
      features: ['Unlimited websites', 'Unlimited clients', '1000 AI generations', 'Team collaboration', 'API access']
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Subscription Management</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`border-2 rounded-xl p-6 ${
              plan.current
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300 transition'
            }`}
          >
            {plan.current && (
              <div className="flex items-center gap-2 text-indigo-600 mb-4">
                <Check className="w-5 h-5" />
                <span className="font-semibold">Current Plan</span>
              </div>
            )}
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold">${plan.price}</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  {feature}
                </li>
              ))}
            </ul>
            {!plan.current && (
              <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                {accountType === 'free' ? 'Upgrade' : 'Switch Plan'}
              </button>
            )}
          </div>
        ))}
      </div>

      {accountType !== 'free' && (
        <div className="mt-8 p-6 bg-gray-50 rounded-xl">
          <h3 className="font-semibold mb-2">Next Billing Date</h3>
          <p className="text-gray-600 mb-4">Your next payment of $99.00 is due on January 15, 2025</p>
          <button className="text-red-600 hover:text-red-700 font-medium">
            Cancel Subscription
          </button>
        </div>
      )}
    </div>
  );
}

// Billing Tab
function BillingTab() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Billing Information</h2>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-4">Payment Method</h3>
          <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-gray-400" />
              <div>
                <p className="font-medium">"""" """" """" 4242</p>
                <p className="text-sm text-gray-600">Expires 12/2025</p>
              </div>
            </div>
            <button className="text-indigo-600 hover:text-indigo-700 font-medium">
              Update
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Billing Address</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Street Address"
              className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="City"
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="ZIP Code"
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Country"
              className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            Save Billing Address
          </button>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Invoices</h3>
          <div className="space-y-3">
            {[
              { date: 'Dec 15, 2024', amount: '$99.00', status: 'Paid' },
              { date: 'Nov 15, 2024', amount: '$99.00', status: 'Paid' },
              { date: 'Oct 15, 2024', amount: '$99.00', status: 'Paid' },
            ].map((invoice, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">{invoice.date}</p>
                  <p className="text-sm text-gray-600">{invoice.amount}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {invoice.status}
                  </span>
                  <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Branding Tab (Developer accounts only)
function BrandingTab() {
  const [logo, setLogo] = useState<string | null>(null);
  const [agencyName, setAgencyName] = useState('');
  const [website, setWebsite] = useState('');
  const [customColors, setCustomColors] = useState({
    primary: '#6366F1',
    secondary: '#8B5CF6'
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">White Label Branding</h2>
      <p className="text-gray-600 mb-6">
        Customize the builder with your own branding when clients use it
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Agency Name
          </label>
          <input
            type="text"
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
            placeholder="Your Agency Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Agency Logo
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            {logo ? (
              <img src={logo} alt="Logo" className="max-h-24 mx-auto" />
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">Upload your logo</p>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                  Choose File
                </button>
              </>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Agency Website
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourwebsite.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Custom Colors
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={customColors.primary}
                  onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                  className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={customColors.primary}
                  onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Secondary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={customColors.secondary}
                  onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                  className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={customColors.secondary}
                  onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Branding
        </button>
      </div>
    </div>
  );
}

// Domains Tab (Developer accounts only)
function DomainsTab() {
  const [newDomain, setNewDomain] = useState('');

  const domains = [
    { domain: 'example.com', status: 'active', ssl: true },
    { domain: 'mysite.com', status: 'pending', ssl: false },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Custom Domains</h2>

      <div className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="yourdomain.com"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition whitespace-nowrap">
            Add Domain
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Add your custom domain to use for deployed websites
        </p>
      </div>

      <div className="space-y-3">
        {domains.map((item, i) => (
          <div key={i} className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium">{item.domain}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`text-sm px-2 py-0.5 rounded-full ${
                    item.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status}
                  </span>
                  {item.ssl && (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <Shield className="w-4 h-4" />
                      SSL Active
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button className="text-red-600 hover:text-red-700 font-medium">
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 p-6 bg-blue-50 rounded-xl">
        <h3 className="font-semibold mb-2">DNS Configuration</h3>
        <p className="text-sm text-gray-700 mb-4">
          Point your domain to our servers by adding these DNS records:
        </p>
        <div className="bg-white rounded border border-blue-200 p-4 font-mono text-sm">
          <p>A Record: 76.76.21.21</p>
          <p>CNAME: cname.webchat.ai</p>
        </div>
      </div>
    </div>
  );
}
