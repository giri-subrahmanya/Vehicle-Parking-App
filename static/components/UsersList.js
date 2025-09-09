export default {
    template: `
    <div>
        <div class="container-fluid bg-dark text-light">
            <div class="row pt-2 pb-2 ps-4 pe-4  align-items-center">
                <div class="col">
                    <h4>NAME : {{name}}</h4>
                    <h4>EMAIL : {{email}}</h4>
                </div>
                <div class="col d-flex justify-content-end">
                    <button class="m-2 btn btn-success" @click="admin_dashboard">DASHBOARD</button>
                </div>
            </div>
        </div>
        <div class="p-4">
            <div>
                <div class="container-fluid bg-dark text-light pt-2 pb-2">
                    <div class="row">
                        <div class="col-9">
                            <h3 class="text-center">USERS LIST</h3>
                        </div>
                        <div class="col-3 align-center">
                            <input type="text" v-model="search_key" class="form-control" placeholder="search email">
                        </div>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="table text-center table-bordered table-info table-hover">
                        <thead>
                            <tr>
                                <th>USER ID</th>
                                <th>NAME</th>
                                <th>EMAIL</th>
                                <th>OVERALL NUMBER OF SPOTS BOOKED</th>
                                <th>MORE DETAILS</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="user in search_users_list">
                                <td>{{user.id}}</td>
                                <td>{{user.name}}</td>
                                <td>{{user.email}}</td>
                                <td>{{user.overall_no_of_spots_booked}}</td>
                                <td>
                                    <button class="btn btn-dark" @click="user_detail(user.id)">Click Here</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            name: '',
            email: '',
            search_key: '',
            users_list: []
        }
    },
    computed: {
        search_users_list: function() {
            if (this.search_key === '') {
                return this.users_list
            }
            else {
                return this.users_list.filter(user => 
                    user.email.toLowerCase().includes(this.search_key.toLowerCase())
                )
            }
        }
    },
    mounted: async function() {
        if (localStorage.getItem('token')) {
            const res = await fetch('/api/user_detail',{
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem('token')
                }
            })
            if (res.status === 200) {
                const data = await res.json()
                if (data.role === 'admin') {
                    this.name = data.name
                    this.email = data.email
                    this.get_users_list()
                }
                else if (data.role === 'user') {
                    this.$router.push('/user')
                }
                else {
                    this.$router.push('/login')
                }
            }
            else {
                this.$router.push('/login')
            }
        }
        else {
            this.$router.push('/login')
        }
    },
    methods: {
        get_users_list: async function() {
            const res = await fetch('/api/admin/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem('token')
                }
            })
            if (res.status === 200) {
                const data = await res.json()
                this.users_list = data
                this.users_list_status = true
            }
            else {
                alert(`Status ${res.status}: Error in fetching the data.`)
                this.$router.push('/admin')
            }
        },
        user_detail: function(id) {
            this.$router.push(`/user_details/${id}`)
        },
        admin_dashboard: function() {
            this.$router.push('/admin')
        }
    }
}