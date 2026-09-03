import React from 'react';
import { useApp } from '../../context/AppContext';
import { usePOS } from '../../context/POSContext';
import { Modal, Button, Input } from '../ui';
import { Armchair } from 'lucide-react';

export const AddTablePOSModal: React.FC = () => {
  const { setAppData } = useApp();
  const { showAddTableModal, setShowAddTableModal, newTableName, setNewTableName } = usePOS();

  if (!showAddTableModal) return null;

  const handleAddTable = () => {
    if (!newTableName.trim()) return;
    const newId = `T${Date.now()}`;
    setAppData((prev: any) => ({
      ...prev,
      tables: [...prev.tables, { id: newId, name: newTableName.trim(), seats: 4 }],
    }));
    setNewTableName('');
    setShowAddTableModal(false);
  };

  return (
    <Modal
      isOpen={showAddTableModal}
      onClose={() => setShowAddTableModal(false)}
      title="Add Custom Table"
      description="Quickly register a temporary or extra dining table"
      maxWidth="sm"
    >
      <div className="space-y-4 py-2">
        <Input
          label="Table Name / Code"
          placeholder="e.g. T-12 or VIP-1"
          value={newTableName}
          onChange={(e) => setNewTableName(e.target.value)}
          leftIcon={<Armchair className="w-4 h-4" />}
          autoFocus
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <Button variant="outline" size="sm" onClick={() => setShowAddTableModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleAddTable} className="font-bold">
            Create Table
          </Button>
        </div>
      </div>
    </Modal>
  );
};
