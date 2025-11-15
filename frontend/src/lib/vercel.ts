interface VercelDeployment {
  id: string
  url: string
  readyState: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR'
  aliasAssigned: boolean
}

const VERCEL_API_TOKEN = import.meta.env.VITE_VERCEL_API_TOKEN
const VERCEL_TEAM_ID = import.meta.env.VITE_VERCEL_TEAM_ID

export const deployToVercel = async (
  htmlContent: string,
  projectName: string
): Promise<VercelDeployment> => {
  try {
    // Create deployment payload
    const files = [
      {
        file: 'index.html',
        data: htmlContent,
      },
    ]

    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        files,
        projectSettings: {
          framework: null,
          buildCommand: null,
          installCommand: null,
        },
        target: 'production',
        ...(VERCEL_TEAM_ID && { teamId: VERCEL_TEAM_ID }),
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Vercel deployment failed: ${error}`)
    }

    const deployment = await response.json()

    return {
      id: deployment.id,
      url: deployment.url,
      readyState: deployment.readyState || 'QUEUED',
      aliasAssigned: deployment.aliasAssigned || false,
    }
  } catch (error: any) {
    console.error('Vercel deployment error:', error)
    throw error
  }
}

export const getDeploymentStatus = async (
  deploymentId: string
): Promise<VercelDeployment> => {
  try {
    const response = await fetch(
      `https://api.vercel.com/v13/deployments/${deploymentId}`,
      {
        headers: {
          Authorization: `Bearer ${VERCEL_API_TOKEN}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to get deployment status')
    }

    const deployment = await response.json()

    return {
      id: deployment.id,
      url: deployment.url,
      readyState: deployment.readyState,
      aliasAssigned: deployment.aliasAssigned,
    }
  } catch (error: any) {
    console.error('Get deployment status error:', error)
    throw error
  }
}

export const assignCustomDomain = async (
  deploymentId: string,
  domain: string
): Promise<void> => {
  try {
    const response = await fetch(
      `https://api.vercel.com/v10/deployments/${deploymentId}/aliases`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${VERCEL_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alias: domain,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to assign domain: ${error}`)
    }
  } catch (error: any) {
    console.error('Assign domain error:', error)
    throw error
  }
}
