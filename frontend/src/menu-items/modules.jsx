// icons
import {
  MessageOutlined,
  UserOutlined,
  HomeOutlined,
  UsergroupAddOutlined,
  BellOutlined,
  StarOutlined
} from '@ant-design/icons';

import {
  HumanQueue,
  Ticket,
  FaceAgent,
  AccountGroup,
  MessageAlertOutline
} from 'mdi-material-ui'

import {
  ROLES
} from '../constants/constants'

const icons = {
  MessageOutlined,
  UserOutlined,
  HomeOutlined,
  UsergroupAddOutlined,
  HumanQueue,
  Ticket,
  FaceAgent,
  AccountGroup,
  BellOutlined,
  MessageAlertOutline,
  StarOutlined
}

const modules = [
  {
    id: 'group-dashboard',
    title: 'Navigation',
    type: 'group',
    access: [ROLES.CENTRAL_ADMIN.value, ROLES.CUSTOMER_SUPPORT.value],
    children: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'item',
        url: '/portal/dashboard',
        icon: icons.HomeOutlined,
        breadcrumbs: false,
        access: [ROLES.CENTRAL_ADMIN.value, ROLES.CUSTOMER_SUPPORT.value],
      }
    ]
  },
  {
    id: 'group-messages',
    title: 'Messages',
    type: 'group',
    access: [ROLES.CENTRAL_ADMIN.value, ROLES.CUSTOMER_SUPPORT.value],
    children: [
      {
        id: 'queue',
        title: 'Queue',
        type: 'item',
        url: '/portal/queue',
        icon: icons.HumanQueue,
        breadcrumbs: false,
        access: [ROLES.CENTRAL_ADMIN.value, ROLES.CUSTOMER_SUPPORT.value],
      },
      {
        id: 'messages',
        title: 'Chats',
        type: 'item',
        url: '/portal/chats',
        icon: icons.MessageOutlined,
        breadcrumbs: false,
        access: [ROLES.CENTRAL_ADMIN.value, ROLES.CUSTOMER_SUPPORT.value],
      }
    ]
  },

  {
    id: 'group-users',
    title: 'Users',
    type: 'group',
    access: [ROLES.CENTRAL_ADMIN.value, ROLES.CUSTOMER_SUPPORT.value],
    children: [
      {
        id: 'clients',
        title: 'Clients',
        type: 'item',
        url: '/portal/users/clients',
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
  },
  {
    id: 'group-notifcations',
    title: 'Notifications',
    type: 'group',
    access: [ROLES.CENTRAL_ADMIN.value, ROLES.CUSTOMER_SUPPORT.value],
    children: [
      {
        id: 'notifications',
        title: 'Notifications',
        type: 'item',
        url: '/portal/notifications',
        icon: icons.BellOutlined,
        breadcrumbs: false,
        access: [ROLES.CENTRAL_ADMIN.value, ROLES.CUSTOMER_SUPPORT.value],
      }
    ]
  },
  {
    id: 'content-hub',
    title: 'Content Hub',
    type: 'group',
    access: [ROLES.CENTRAL_ADMIN.value, ROLES.CUSTOMER_SUPPORT.value],
    children: [
      {
        id: 'content-hub',
        title: 'Quick Chats',
        type: 'item',
        url: '/portal/content-hub/quick-chats',
        icon: icons.MessageAlertOutline,
        breadcrumbs: false,
        access: [ROLES.CENTRAL_ADMIN.value, ROLES.CUSTOMER_SUPPORT.value],
      }
    ]
  },
  {
    id: 'group-ratings',
    title: 'Ratings',
    type: 'group',
    access: [ROLES.CENTRAL_ADMIN.value, ROLES.CUSTOMER_SUPPORT.value],
    children: [
      {
        id: 'ratings',
        title: 'Ratings',
        type: 'item',
        url: '/portal/ratings',
        icon: icons.StarOutlined,
        breadcrumbs: false,
        access: [ROLES.CENTRAL_ADMIN.value, ROLES.CUSTOMER_SUPPORT.value],
      }
    ]
  },
]

export default modules;
