/**
 * ProjectCard Component - Glassmorphism Edition
 * 3D tilt effect, glass morphism design, smooth animations
 * Preserves all functionality from original
 */

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconEye, IconEdit, IconTrash, IconWorld } from '@tabler/icons-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Website } from '@/hooks/useWebsites';

interface ProjectCardProps {
  website: Website;
  onDelete: (id: string) => void;
  index?: number;
}

export function ProjectCard({ website, onDelete, index = 0 }: ProjectCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D tilt effect using Framer Motion
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7.5deg', '-7.5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7.5deg', '7.5deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleEdit = () => {
    navigate(`/builder/${website.id}`);
  };

  const handlePreview = () => {
    window.open(`/preview/${website.id}`, '_blank');
  };

  const handleDelete = () => {
    onDelete(website.id);
    setShowDeleteModal(false);
  };

  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d'
        }}
        className="group relative h-full"
      >
        {/* Glass Card Container */}
        <div
          className="
            relative overflow-hidden rounded-2xl
            bg-gradient-to-br from-background/60 to-background/40
            backdrop-blur-xl border border-foreground/[0.08]
            shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]
            transition-all duration-300 ease-out
            hover:shadow-[0_20px_60px_0_rgba(0,0,0,0.2)]
            hover:border-foreground/[0.12]
          "
          style={{ transform: 'translateZ(20px)' }}
        >
          {/* Top highlight line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Preview Image Section */}
          <div className="relative aspect-video overflow-hidden">
            {website.preview_image_url ? (
              <img
                src={website.preview_image_url}
                alt={website.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-500/20 via-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <IconWorld className="w-16 h-16 text-foreground/20" />
              </div>
            )}

            {/* Hover Action Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePreview}
                className="p-4 bg-white/95 text-foreground rounded-full hover:bg-white transition-colors shadow-lg backdrop-blur-sm"
                title="Preview"
                aria-label="Preview website"
              >
                <IconEye className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEdit}
                className="p-4 bg-violet-500 text-white rounded-full hover:bg-violet-600 transition-colors shadow-lg"
                title="Edit"
                aria-label="Edit website"
              >
                <IconEdit className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Info Section */}
          <div className="p-5 space-y-3">
            {/* Title and Delete Button */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-lg text-foreground line-clamp-1 flex-1">
                {website.name}
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteModal(true)}
                className="p-2 text-foreground/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete"
                aria-label="Delete website"
              >
                <IconTrash className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Description */}
            {website.description && (
              <p className="text-sm text-foreground/60 line-clamp-2">
                {website.description}
              </p>
            )}

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              {website.deployment_status === 'live' && <Badge variant="success">Live</Badge>}
              {website.deployment_status === 'deploying' && <Badge variant="info">Deploying</Badge>}
              {website.deployment_status === 'draft' && <Badge variant="warning">Draft</Badge>}
              {website.deployment_status === 'failed' && <Badge variant="error">Failed</Badge>}
              {website.deployment_status === 'archived' && <Badge variant="default">Archived</Badge>}
            </div>

            {/* Created Date */}
            <p className="text-xs text-foreground/40">
              Created {new Date(website.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>

          {/* Glass reflection effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Website"
      >
        <div className="space-y-4">
          <p className="text-foreground/70">
            Are you sure you want to delete <strong>"{website.name}"</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex-1"
            >
              Delete
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
