import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { GameMode } from '../types';
import './ParentZone.css';

interface ParentZoneProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ParentZone: React.FC<ParentZoneProps> = ({ isOpen, onClose }) => {
  const {
    config,
    lists,
    updateConfig,
    createList,
    removeList,
    exportData,
    importData
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'settings' | 'lists' | 'data'>('settings');
  const [newListTitle, setNewListTitle] = useState('');
  const [newListType, setNewListType] = useState<GameMode>('WORDS');

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fill-celebrate-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export data');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        await importData(data);
        alert('Data imported successfully!');
      } catch (error) {
        alert('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleCreateList = async () => {
    if (!newListTitle.trim()) return;

    try {
      await createList(newListTitle.trim(), newListType);
      setNewListTitle('');
      setNewListType('WORDS');
    } catch (error) {
      alert('Failed to create list');
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (confirm('Are you sure you want to delete this list?')) {
      try {
        await removeList(listId);
      } catch (error) {
        alert('Failed to delete list');
      }
    }
  };

  return (
    <div className="parent-zone-overlay" onClick={onClose}>
      <div className="parent-zone" onClick={e => e.stopPropagation()}>
        <header className="parent-zone__header">
          <h2>Parent Zone</h2>
          <button className="parent-zone__close" onClick={onClose}>✕</button>
        </header>

        <nav className="parent-zone__tabs">
          <button
            className={`parent-zone__tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
          <button
            className={`parent-zone__tab ${activeTab === 'lists' ? 'active' : ''}`}
            onClick={() => setActiveTab('lists')}
          >
            Word Lists
          </button>
          <button
            className={`parent-zone__tab ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            Data
          </button>
        </nav>

        <div className="parent-zone__content">
          {activeTab === 'settings' && (
            <div className="parent-zone__section">
              <h3>Game Settings</h3>

              <div className="parent-zone__setting">
                <label>Boxes per Round</label>
                <input
                  type="range"
                  min="2"
                  max="12"
                  value={config.boxesPerRound}
                  onChange={(e) => updateConfig({ boxesPerRound: parseInt(e.target.value) })}
                />
                <span>{config.boxesPerRound}</span>
              </div>

              <div className="parent-zone__setting">
                <label>
                  <input
                    type="checkbox"
                    checked={config.soundsEnabled}
                    onChange={(e) => updateConfig({ soundsEnabled: e.target.checked })}
                  />
                  Enable Sounds
                </label>
              </div>

              <div className="parent-zone__setting">
                <label>Default Mode</label>
                <select
                  value={config.mode}
                  onChange={(e) => updateConfig({ mode: e.target.value as GameMode })}
                >
                  <option value="LETTERS">Letters</option>
                  <option value="NUMBERS">Numbers</option>
                  <option value="WORDS">Words</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'lists' && (
            <div className="parent-zone__section">
              <h3>Manage Word Lists</h3>

              <div className="parent-zone__create-list">
                <h4>Create New List</h4>
                <div className="parent-zone__form-row">
                  <input
                    type="text"
                    placeholder="List title"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                  />
                  <select
                    value={newListType}
                    onChange={(e) => setNewListType(e.target.value as GameMode)}
                  >
                    <option value="WORDS">Words</option>
                    <option value="NUMBERS">Numbers</option>
                    <option value="LETTERS">Letters</option>
                  </select>
                  <button onClick={handleCreateList}>Create</button>
                </div>
              </div>

              <div className="parent-zone__lists">
                <h4>Existing Lists</h4>
                {lists.map((list) => (
                  <div key={list.id} className="parent-zone__list-item">
                    <div className="parent-zone__list-info">
                      <strong>{list.title}</strong>
                      <span>({list.type}) - {list.items.length} items</span>
                    </div>
                    <div className="parent-zone__list-actions">
                      <button onClick={() => console.log('Edit', list.id)}>Edit</button>
                      <button onClick={() => handleDeleteList(list.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="parent-zone__section">
              <h3>Data Management</h3>

              <div className="parent-zone__data-actions">
                <button onClick={handleExport} className="parent-zone__export-btn">
                  📥 Export Data
                </button>

                <div className="parent-zone__import">
                  <label htmlFor="import-file" className="parent-zone__import-btn">
                    📤 Import Data
                  </label>
                  <input
                    id="import-file"
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              <div className="parent-zone__data-info">
                <p><strong>Lists:</strong> {lists.length}</p>
                <p><strong>Total Items:</strong> {lists.reduce((sum, list) => sum + list.items.length, 0)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};