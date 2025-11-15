import { useState } from 'react'
import { useDeploymentStore } from '@/store/deploymentStore'
import { motion } from 'framer-motion'
import { RocketLaunchIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface DeployButtonProps {
  projectId: string
  projectName: string
}

export const DeployButton = ({ projectId, projectName }: DeployButtonProps) => {
  const { deploy, isDeploying, currentDeployment } = useDeploymentStore()
  const [showModal, setShowModal] = useState(false)

  const handleDeploy = async () => {
    try {
      await deploy(projectId, projectName)
      toast.success('Deployment started!')
      setShowModal(true)
    } catch (error: any) {
      toast.error(error.message || 'Deployment failed')
    }
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleDeploy}
        disabled={isDeploying}
        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500
                 text-white rounded-xl font-semibold flex items-center gap-2
                 hover:shadow-lg hover:shadow-purple-500/50 transition-shadow
                 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RocketLaunchIcon className="w-5 h-5" />
        {isDeploying ? 'Deploying...' : 'Deploy to Production'}
      </motion.button>

      {/* Deployment Status Modal */}
      {showModal && currentDeployment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4"
          >
            <h3 className="text-2xl font-bold text-white mb-4">
              {currentDeployment.status === 'deploying' && '🚀 Deploying...'}
              {currentDeployment.status === 'ready' && '✨ Deployed!'}
              {currentDeployment.status === 'error' && '❌ Deployment Failed'}
            </h3>

            {currentDeployment.status === 'ready' && (
              <>
                <p className="text-white/70 mb-4">
                  Your website is now live!
                </p>
                <a
                  href={currentDeployment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-4 py-3 bg-purple-500
                           text-white rounded-xl font-medium hover:bg-purple-600
                           transition-colors"
                >
                  Visit Website →
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentDeployment.url)
                    toast.success('Link copied!')
                  }}
                  className="w-full mt-3 px-4 py-3 bg-white/10 text-white
                           rounded-xl font-medium hover:bg-white/20 transition-colors"
                >
                  Copy Link
                </button>
              </>
            )}

            {currentDeployment.status === 'deploying' && (
              <div className="flex flex-col items-center py-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mb-4" />
                <p className="text-white/50 text-sm">
                  This usually takes 30-60 seconds...
                </p>
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-4 text-white/50 hover:text-white text-sm"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </>
  )
}
