import Api from './Api'
import ProfileController from './ProfileController'
import Auth from './Auth'

const Controllers = {
    Api: Object.assign(Api, Api),
    ProfileController: Object.assign(ProfileController, ProfileController),
    Auth: Object.assign(Auth, Auth),
}

export default Controllers