import React, { useEffect, useState } from 'react';
import { DEFAULT_PROFILE_NAME, PROFILE_AVATARS } from '../data/profileAvatars.js';

export default function ProfileEditorModal({ isOpen, initialName, initialAvatar, onClose, onSave }) {
  const [name, setName] = useState(initialName || DEFAULT_PROFILE_NAME);
  const [avatar, setAvatar] = useState(initialAvatar || PROFILE_AVATARS[0]);

  useEffect(() => {
    if (!isOpen) return;
    setName(initialName || DEFAULT_PROFILE_NAME);
    setAvatar(initialAvatar || PROFILE_AVATARS[0]);
  }, [isOpen, initialName, initialAvatar]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#1b6b4f]">Edit profile</h3>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-[#4a6365] hover:bg-[#f3ebf7]">✕</button>
        </div>

        <label className="mb-4 block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#4a6365]">Display name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={30}
            className="w-full rounded-xl border border-[#bec9c2] px-3 py-2 font-semibold text-[#1d1a22]"
          />
        </label>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#4a6365]">Choose avatar</p>
          <div className="grid grid-cols-3 gap-3">
            {PROFILE_AVATARS.map((item) => {
              const selected = item === avatar;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setAvatar(item)}
                  className={`overflow-hidden rounded-2xl border-2 ${selected ? 'border-[#1b6b4f]' : 'border-transparent'} h-20 w-full`}
                >
                  <img src={item} alt="Avatar option" className="h-full w-full object-cover" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 font-semibold text-[#4a6365]">Cancel</button>
          <button
            type="button"
            onClick={() => onSave({ name: name.trim() || DEFAULT_PROFILE_NAME, avatar })}
            className="rounded-full bg-[#1b6b4f] px-5 py-2 font-semibold text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
