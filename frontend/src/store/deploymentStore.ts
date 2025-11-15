import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { deployToVercel, getDeploymentStatus } from '@/lib/vercel'

export interface Deployment {
  id: string
  projectId: string
  vercelDeploymentId: string
  url: string
  status: 'deploying' | 'ready' | 'error'
  customDomain?: string
  createdAt: Date
}

interface DeploymentState {
  deployments: Deployment[]
  currentDeployment: Deployment | null
  isDeploying: boolean
  error: string | null

  deploy: (projectId: string, projectName: string) => Promise<void>
  checkDeploymentStatus: (deploymentId: string) => Promise<void>
  loadDeployments: (projectId: string) => Promise<void>
}

export const useDeploymentStore = create<DeploymentState>((set) => ({
  deployments: [],
  currentDeployment: null,
  isDeploying: false,
  error: null,

  deploy: async (projectId: string, projectName: string) => {
    set({ isDeploying: true, error: null })

    try {
      // Get active generated code
      const { data: code, error: codeError } = await supabase
        .from('generated_code')
        .select('html_content')
        .eq('project_id', projectId)
        .eq('is_active', true)
        .single()

      if (codeError || !code) {
        throw new Error('No code to deploy')
      }

      // Deploy to Vercel
      const vercelDeployment = await deployToVercel(
        code.html_content,
        projectName
      )

      // Save deployment to database
      const { data: deployment, error: dbError } = await supabase
        .from('deployments')
        .insert({
          project_id: projectId,
          vercel_deployment_id: vercelDeployment.id,
          url: `https://${vercelDeployment.url}`,
          status: 'deploying',
        })
        .select()
        .single()

      if (dbError) throw dbError

      const newDeployment: Deployment = {
        id: deployment.id,
        projectId: deployment.project_id,
        vercelDeploymentId: deployment.vercel_deployment_id,
        url: deployment.url,
        status: deployment.status,
        createdAt: new Date(deployment.created_at),
      }

      set({ currentDeployment: newDeployment })

      // Poll for deployment status
      const pollInterval = setInterval(async () => {
        try {
          const status = await getDeploymentStatus(vercelDeployment.id)

          if (status.readyState === 'READY') {
            clearInterval(pollInterval)

            // Update database
            await supabase
              .from('deployments')
              .update({ status: 'ready' })
              .eq('id', deployment.id)

            // Update project
            await supabase
              .from('projects')
              .update({
                status: 'deployed',
                deployed_url: `https://${status.url}`,
              })
              .eq('id', projectId)

            set(state => ({
              currentDeployment: state.currentDeployment ? {
                ...state.currentDeployment,
                status: 'ready',
              } : null,
            }))

            set({ isDeploying: false })
          } else if (status.readyState === 'ERROR') {
            clearInterval(pollInterval)

            await supabase
              .from('deployments')
              .update({ status: 'error' })
              .eq('id', deployment.id)

            set({
              error: 'Deployment failed',
              isDeploying: false,
            })
          }
        } catch (error) {
          clearInterval(pollInterval)
          set({
            error: 'Failed to check deployment status',
            isDeploying: false,
          })
        }
      }, 5000) // Check every 5 seconds

    } catch (error: any) {
      set({ error: error.message, isDeploying: false })
    }
  },

  checkDeploymentStatus: async (deploymentId: string) => {
    try {
      const { data, error } = await supabase
        .from('deployments')
        .select('*')
        .eq('id', deploymentId)
        .single()

      if (error) throw error

      const deployment: Deployment = {
        id: data.id,
        projectId: data.project_id,
        vercelDeploymentId: data.vercel_deployment_id,
        url: data.url,
        status: data.status,
        customDomain: data.custom_domain,
        createdAt: new Date(data.created_at),
      }

      set({ currentDeployment: deployment })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  loadDeployments: async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('deployments')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const deployments: Deployment[] = data.map(d => ({
        id: d.id,
        projectId: d.project_id,
        vercelDeploymentId: d.vercel_deployment_id,
        url: d.url,
        status: d.status,
        customDomain: d.custom_domain,
        createdAt: new Date(d.created_at),
      }))

      set({ deployments })
    } catch (error: any) {
      set({ error: error.message })
    }
  },
}))
