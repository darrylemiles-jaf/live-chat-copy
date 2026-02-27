import { useState, useEffect, useMemo } from 'react';
import { useGetUsers } from '../api/users';
import socketService from '../services/socketService';
import { transformAgent, getStatusColor } from '../utils/agents/agentTransformers';
import { agentColumns, agentViewConfig } from '../utils/agents/agentTableConfig';
import { getAgentRatings } from '../api/ratingsApi';

export const useSupportAgents = () => {
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [formData, setFormData] = useState({ id: '', name: '', email: '', role: '', status: '', successfulAssists: 0 });
  const [agents, setAgents] = useState([]);
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [agentRatingData, setAgentRatingData] = useState(null);
  const [loadingAgentRating, setLoadingAgentRating] = useState(false);

  const { users, usersLoading, usersError, usersMutate } = useGetUsers({ role: 'support' });

  // Populate agents from API
  useEffect(() => {
    if (users && users.length > 0) {
      setAgents(users.map(transformAgent));
    }
  }, [users]);

  // Socket – live status updates
  useEffect(() => {
    let attached = false;

    const handler = (data) => {
      const normalized = data.status.charAt(0).toUpperCase() + data.status.slice(1);
      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === data.userId ? { ...agent, status: normalized } : agent
        )
      );
      setSelectedAgent((prev) =>
        prev && prev.id === data.userId ? { ...prev, status: normalized } : prev
      );
    };

    const tryAttach = () => {
      const s = socketService.socket;
      if (s && !attached) {
        s.on('user_status_changed', handler);
        attached = true;
      }
    };

    tryAttach();
    const retry = setInterval(() => {
      if (attached) { clearInterval(retry); return; }
      tryAttach();
    }, 500);

    return () => {
      clearInterval(retry);
      const s = socketService.socket;
      if (s && attached) s.off('user_status_changed', handler);
    };
  }, []);

  // ---------- handlers ----------
  const handleViewById = (agent) => {
    setSelectedAgent(agent);
    setOpenViewModal(true);
    // Fetch this agent's ratings
    setAgentRatingData(null);
    setLoadingAgentRating(true);
    getAgentRatings(agent.id)
      .then((res) => { if (res) setAgentRatingData(res); })
      .catch(() => { })
      .finally(() => setLoadingAgentRating(false));
  };

  const handleCloseViewModal = () => {
    setOpenViewModal(false);
    setSelectedAgent(null);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setFormData({});
  };

  const handleCreateClick = () => {
    setFormData({ id: '', name: '', email: '', role: 'Agent', status: 'Available', successfulAssists: 0 });
    setOpenCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    setFormData({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setAgents((prev) => prev.map((agent) => (agent.id === formData.id ? formData : agent)));
    handleCloseEditModal();
  };

  const handleCreate = () => {
    const maxId = Math.max(...agents.map((a) => parseInt(a.id.split('-')[1] || 0)));
    const newAgent = {
      ...formData,
      id: `AGT-${String(maxId + 1).padStart(4, '0')}`,
      successfulAssists: 0
    };
    setAgents((prev) => [newAgent, ...prev]);
    handleCloseCreateModal();
  };

  const handleClearFilters = () => {
    setFilterRole('');
    setFilterStatus('');
  };

  // ---------- derived state ----------
  const uniqueRoles = useMemo(
    () => Array.from(new Set(agents.map((r) => r.role))).sort(),
    [agents]
  );

  const filteredRowsForTable = useMemo(() => {
    const mapStatusLabel = (s) => getStatusColor(s).label;

    const filtered = agents.filter((r) => {
      if (filterRole && r.role !== filterRole) return false;
      if (filterStatus) {
        const label = mapStatusLabel(r.status);
        if (label !== filterStatus) return false;
      }
      return true;
    });

    const weight = (r) => {
      const label = mapStatusLabel(r.status);
      if (label === 'Available') return 0;
      if (label === 'Busy') return 1;
      if (label === 'Away') return 2;
      return 3;
    };

    return filtered.slice().sort((a, b) => {
      const wa = weight(a);
      const wb = weight(b);
      if (wa !== wb) return wa - wb;
      return a.name.localeCompare(b.name);
    });
  }, [agents, filterRole, filterStatus]);

  const columns = agentColumns;
  const viewConfig = agentViewConfig;

  return {
    // state
    openViewModal,
    openEditModal,
    openCreateModal,
    selectedAgent,
    formData,
    filterRole,
    filterStatus,
    // api
    usersLoading,
    usersError,
    usersMutate,
    // derived
    filteredRowsForTable,
    uniqueRoles,
    columns,
    viewConfig,
    // handlers
    handleViewById,
    handleCloseViewModal,
    handleCloseEditModal,
    handleCreateClick,
    handleCloseCreateModal,
    handleFormChange,
    handleSave,
    handleCreate,
    handleClearFilters,
    setFilterRole,
    setFilterStatus,
    // ratings
    agentRatingData,
    loadingAgentRating
  };
};
