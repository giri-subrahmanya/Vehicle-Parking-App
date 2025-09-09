import Home from './components/Home.js'
import Login from './components/Login.js'
import Register from './components/Register.js'
import Admin from './components/Admin.js'
import User from './components/User.js'
import ParkingLot from './components/ParkingLot.js'
import CreateLot from './components/CreateLot.js'
import UsersList from './components/UsersList.js'
import AdminAnalytics from './components/AdminAnalytics.js'
import BookSpot from './components/BookSpot.js'
import UserDetails from './components/UserDetails.js'
import EditLot from './components/EditLot.js'
import ParkingSpot from './components/ParkingSpot.js'
import UserAnalytics from './components/UserAnalytics.js'

const routes = [
    {path: '/', component: Home},
    {path: '/login', component: Login},
    {path: '/register', component: Register},
    {path: '/admin', component: Admin},
    {path: '/user', component: User},
    {path: '/parking_lot/:id', component: ParkingLot},
    {path: '/create_lot', component: CreateLot},
    {path: '/users_list', component: UsersList},
    {path: '/admin_analytics', component: AdminAnalytics},
    {path: '/book_spot/:id', component: BookSpot},
    {path: '/user_details/:id', component: UserDetails},
    {path: '/edit_lot/:id', component: EditLot},
    {path: '/parking_spot/:id', component: ParkingSpot},
    {path: '/user_analytics', component: UserAnalytics}
]

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes: routes
})

const app = Vue.createApp({
    template: `
        <div>
            <router-view></router-view>
        </div>
    `
})

app.use(router)
app.mount('#app')

console.log('Vue app is starting...')

