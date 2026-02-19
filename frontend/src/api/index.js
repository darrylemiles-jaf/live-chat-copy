import Tickets from './tickets'
import Users from './users'

const agent = {
  ...Tickets,
  ...Users
}

export default agent;