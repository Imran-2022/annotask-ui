'use client';

import React, { useState } from 'react';
import { Annotation, AnnotationComment, AnnotationLayer, UserPresence } from '@/types';

interface CollaborationPanelProps {
  activeUsers: UserPresence[];
  annotations: Annotation[];
  layers: AnnotationLayer[];
  selectedAnnotation?: Annotation;
  comments: AnnotationComment[];
  onAddComment?: (text: string) => void;
  onToggleLayerVisibility?: (layerId: number) => void;
  onSelectAnnotation?: (annotationId: number) => void;
  onShowAnnotationHistory?: (annotationId: number) => void;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  activeUsers,
  annotations,
  layers,
  selectedAnnotation,
  comments,
  onAddComment,
  onToggleLayerVisibility,
  onSelectAnnotation,
  onShowAnnotationHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'comments' | 'layers' | 'history'>('users');
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment?.(newComment);
      setNewComment('');
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        {(['users', 'comments', 'layers', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-3 py-2 text-sm font-medium transition ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tab === 'users' && '👥'}
            {tab === 'comments' && '💬'}
            {tab === 'layers' && '📚'}
            {tab === 'history' && '📜'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Active Users */}
        {activeTab === 'users' && (
          <div className="space-y-2">
            <h3 className="font-semibold text-white mb-2">
              Active Users ({activeUsers.length})
            </h3>
            {activeUsers.length === 0 ? (
              <p className="text-gray-400 text-sm">No other users active</p>
            ) : (
              activeUsers.map(user => (
                <div
                  key={user.id}
                  className="bg-gray-700 p-2 rounded text-sm text-gray-200 flex items-center gap-2"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  {user.user_email}
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(user.last_seen).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Comments */}
        {activeTab === 'comments' && (
          <div className="space-y-3">
            <h3 className="font-semibold text-white">Comments</h3>
            
            {/* Add Comment */}
            {selectedAnnotation && (
              <div className="bg-gray-700 p-2 rounded">
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-gray-600 text-white text-xs p-2 rounded border border-gray-500 resize-none"
                  rows={2}
                />
                <button
                  onClick={handleAddComment}
                  className="mt-2 w-full bg-blue-600 text-white text-xs py-1 rounded hover:bg-blue-700 transition"
                >
                  Post Comment
                </button>
              </div>
            )}

            {/* Comments List */}
            {comments.length === 0 ? (
              <p className="text-gray-400 text-sm">
                {selectedAnnotation ? 'No comments yet' : 'Select an annotation to view comments'}
              </p>
            ) : (
              <div className="space-y-2">
                {comments.map(comment => (
                  <div key={comment.id} className="bg-gray-700 p-2 rounded text-xs">
                    <p className="text-gray-300 font-semibold">{comment.author_email}</p>
                    <p className="text-gray-200 mt-1">{comment.text}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Layers */}
        {activeTab === 'layers' && (
          <div className="space-y-2">
            <h3 className="font-semibold text-white mb-2">Layers ({layers.length})</h3>
            {layers.length === 0 ? (
              <p className="text-gray-400 text-sm">No layers yet</p>
            ) : (
              layers.map(layer => (
                <div
                  key={layer.id}
                  className="bg-gray-700 p-2 rounded flex items-center justify-between text-sm"
                >
                  <label className="flex items-center gap-2 text-gray-200 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={layer.is_visible}
                      onChange={() => onToggleLayerVisibility?.(layer.id)}
                      className="w-4 h-4"
                    />
                    {layer.name}
                  </label>
                  <span className="text-xs text-gray-400">
                    {annotations.filter(a => a.label_class === layer.name).length}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* History */}
        {activeTab === 'history' && (
          <div className="space-y-2">
            <h3 className="font-semibold text-white mb-2">Annotation History</h3>
            {annotations.length === 0 ? (
              <p className="text-gray-400 text-sm">No annotations yet</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {annotations.map(annotation => (
                  <div
                    key={annotation.id}
                    onClick={() => {
                      onSelectAnnotation?.(annotation.id);
                      onShowAnnotationHistory?.(annotation.id);
                    }}
                    className="bg-gray-700 p-2 rounded cursor-pointer hover:bg-gray-600 transition text-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-200 font-semibold">
                          {annotation.label_class}
                        </p>
                        <p className="text-gray-400">
                          by {annotation.creator_email}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        annotation.review_status === 'approved' ? 'bg-green-900 text-green-200' :
                        annotation.review_status === 'rejected' ? 'bg-red-900 text-red-200' :
                        annotation.review_status === 'flagged' ? 'bg-yellow-900 text-yellow-200' :
                        'bg-gray-900 text-gray-200'
                      }`}>
                        {annotation.review_status}
                      </span>
                    </div>
                    <p className="text-gray-400 mt-1">
                      {new Date(annotation.created_at).toLocaleString()}
                    </p>
                    {annotation.is_locked && (
                      <p className="text-yellow-400 mt-1">🔒 Locked by {annotation.locked_by}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
