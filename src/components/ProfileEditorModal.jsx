import React, { useEffect, useState } from 'react';
import { DEFAULT_PROFILE_NAME, PROFILE_AVATARS } from '../data/profileAvatars.js';
import Modal from './ui/Modal.jsx';

export default function ProfileEditorModal({ isOpen, initialName, initialAvatar, onClose, onSave }) {
  const [name, setName] = useState(initialName || DEFAULT_PROFILE_NAME);
  const [avatar, setAvatar] = useState(initialAvatar || PROFILE_AVATARS[0]);

  useEffect(() => {
    if (!isOpen) return;
    setName(initialName || DEFAULT_PROFILE_NAME);
    setAvatar(initialAvatar || PROFILE_AVATARS[0]);
  }, [isOpen, initialName, initialAvatar]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} titleId="profile-editor-title">
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 id="profile-editor-title" className="text-lg font-bold" style={{ color: 'var(--app-primary)' }}>Edit profile</h3>
          <button type="button" onClick={onClose} className="rounded-full p-2 transition-colors" style={{ color: 'var(--app-muted)' }} aria-label="Close">✕</button>
        </div>

        <label className="mb-4 block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--app-muted)' }}>Display name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={30}
            className="w-full rounded-xl px-3 py-2 font-semibold"
            style={{
              border: '1px solid var(--app-input-border)',
              background: 'var(--app-input-bg)',
              color: 'var(--app-on-surface)',
            }}
          />
        </label>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--app-muted)' }}>Choose avatar</p>
          <div className="grid grid-cols-3 gap-3">
            {PROFILE_AVATARS.map((item) => {
              const selected = item === avatar;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setAvatar(item)}
                  className="overflow-hidden rounded-2xl border-2 h-20 w-full transition-colors"
                  style={{
                    borderColor: selected ? 'var(--app-primary)' : 'transparent',
                  }}
                >
                  <img src={item} alt="Avatar option" className="h-full w-full object-cover" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 font-semibold" style={{ color: 'var(--app-muted)' }}>Cancel</button>
          <button
            type="button"
            onClick={() => onSave({ name: name.trim() || DEFAULT_PROFILE_NAME, avatar })}
            className="rounded-full px-5 py-2 font-semibold"
            style={{ background: 'var(--app-primary)', color: 'var(--app-on-primary)' }}
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
