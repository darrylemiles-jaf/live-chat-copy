// icons
import {
  DashboardOutlined,
  MessageOutlined,
  UserOutlined,
  HomeOutlined,
  UsergroupAddOutlined
} from '@ant-design/icons';

const icons = {
  DashboardOutlined,
  MessageOutlined,
  UserOutlined,
  HomeOutlined,
  UsergroupAddOutlined
}

const modules = [
  {
    id: 'group-dashboard',
    title: 'Navigation',
    type: 'group',
    // access: [POSITIONS.POSITIONS_STAFF, POSITIONS.POSITIONS_MASTER_ADMIN],
    children: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'item',
        url: '/portal/dashboard',
        icon: icons.HomeOutlined,
        breadcrumbs: false,
        // access: [POSITIONS.POSITIONS_STAFF, POSITIONS.POSITIONS_MASTER_ADMIN],
      }
    ]
  },
  {
    id: 'group-ticketing',
    title: 'Conversations',
    type: 'group',
    // access: [POSITIONS.POSITIONS_STAFF, POSITIONS.POSITIONS_MASTER_ADMIN],
    children: [
      {
        id: 'ticketing',
        title: 'Messages',
        type: 'item',
        url: '/portal/messages',
        icon: icons.MessageOutlined,
        breadcrumbs: false,
        // access: [POSITIONS.POSITIONS_STAFF, POSITIONS.POSITIONS_MASTER_ADMIN],
      }
    ]
  },
  {
    id: 'group-ticketing',
    title: 'Ticketing',
    type: 'group',
    // access: [POSITIONS.POSITIONS_STAFF, POSITIONS.POSITIONS_MASTER_ADMIN],
    children: [
      {
        id: 'conversations',
        title: 'Tickets',
        type: 'item',
        url: '/portal/tickets',
        icon: icons.MessageOutlined,
        breadcrumbs: false,
        // access: [POSITIONS.POSITIONS_STAFF, POSITIONS.POSITIONS_MASTER_ADMIN],
      }
    ]
  },
  {
    id: 'group-users',
    title: 'Users',
    type: 'group',
    // access: [POSITIONS.POSITIONS_STAFF, POSITIONS.POSITIONS_MASTER_ADMIN],
    children: [
      {
        id: 'users',
        title: 'Users',
        type: 'item',
        url: '/portal/users',
        icon: icons.UsergroupAddOutlined,
        breadcrumbs: false,
        // access: [POSITIONS.POSITIONS_STAFF, POSITIONS.POSITIONS_MASTER_ADMIN],
      }
    ]
  },
]

export default modules;
