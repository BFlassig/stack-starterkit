import HealthCheckController from './HealthCheckController'
import UserController from './UserController'

const V1 = {
    HealthCheckController: Object.assign(HealthCheckController, HealthCheckController),
    UserController: Object.assign(UserController, UserController),
}

export default V1