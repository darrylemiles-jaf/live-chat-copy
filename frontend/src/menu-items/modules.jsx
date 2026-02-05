// icons
import {
  DashboardOutlined,
  MessageOutlined,
  UserOutlined,
  HomeOutlined,
  UsergroupAddOutlined,
  BellOutlined
} from '@ant-design/icons';

import {
  HumanQueue,
  Ticket,
  FaceAgent,
  AccountGroup
} from 'mdi-material-ui'

const icons = {
  DashboardOutlined,
  MessageOutlined,
  UserOutlined,
  HomeOutlined,
  UsergroupAddOutlined,
  HumanQueue,
  Ticket,
  FaceAgent,
  AccountGroup,
  BellOutlined
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
    id: 'group-messages',
    title: 'Messages',
    type: 'group',
    // access: [POSITIONS.POSITIONS_STAFF, POSITIONS.POSITIONS_MASTER_ADMIN],
    children: [
      {
        id: 'queue',
        title: 'Queue',
        type: 'item',
        url: '/portal/queue',
        icon: icons.HumanQueue,
        breadcrumbs: false,
        // access: [POSITIONS.POSITIONS_STAFF, POSITIONS.POSITIONS_MASTER_ADMIN],
      },
      {
        id: 'messages',
        title: 'Chats',
        type: 'item',
        url: '/portal/chats',
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
        icon: icons.Ticket,
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
        type: 'collapse',
        icon: icons.AccountGroup,
        breadcrumbs: false,
        // access: [POSITIONS.POSITIONS_STAFF, POSITIONS.POSITIONS_MASTER_ADMIN],
        children: [
          {
            id: 'customers',
            title: 'Customers',
            type: 'item',
            url: '/portal/users/customers',
            icon: icons.UsergroupAddOutlined,
            breadcrumbs: false,
          },
          {
            id: 'supports',
            title: 'Support Agents',
            type: 'item',
            url: '/portal/users/supports',
            icon: icons.FaceAgent,
            breadcrumbs: false,
          }
        ]
      }
    ]
  },
  {
    id: 'group-notifcations',
    title: 'Notifications',
    type: 'group',
    // access: [POSITIONS.POSITIONS_STAFF, POSITIONS.POSITIONS_MASTER_ADMIN],
    children: [
      {
        id: 'notifications',
        title: 'Notifications',
        type: 'item',
        url: '/portal/notifications',
        icon: icons.BellOutlined,
        breadcrumbs: false,
        // access: [POSITIONS.POSITIONS_STAFF, POSITIONS.POSITIONS_MASTER_ADMIN],
      }
    ]
  },
]

export default modules;
