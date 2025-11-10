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
                    <button class="m-2 btn btn-success" @click="create_lot">CREATE LOT</button>
                    <button class="m-2 btn btn-success" @click="users_list">LIST OF USERS</button>
                    <button class="m-2 btn btn-success" @click="analytics">ANALYTICS</button>
                    <button class="m-2 btn btn-success" @click='logout'>LOGOUT</button>
                </div>
            </div>
        </div>
        <div class="p-4">
            <div>
                <div class="container-fluid bg-dark text-light pt-2 pb-2">
                    <div class="row">
                        <div class="col-9">
                            <h3 class="text-center">PARKING LOTS</h3>
                        </div>
                        <div class="col-3 align-center">
                            <input type="text" v-model="search_key" class="form-control"
                                placeholder="search prime_location_name">
                        </div>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="table text-center table-bordered table-info table-hover">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>PRIME LOCATION NAME</th>
                                <th>PRICE PER MINUTE</th>
                                <th>NUMBER OF SPOTS</th>
                                <th>PINCODE</th>
                                <th>ADDRESS</th>
                                <th>NUMBER OF RESERVED SPOTS</th>
                                <th>NUMBER OF AVAILABLE SPOTS</th>
                                <th>MORE DETAILS</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="lot in search_parking_lots">
                                <td>{{lot.id}}</td>
                                <td>{{lot.prime_location_name}}</td>
                                <td>{{lot.price_per_minute}}</td>
                                <td>{{lot.number_of_spots}}</td>
                                <td>{{lot.pincode}}</td>
                                <td>{{lot.address}}</td>
                                <td>{{lot.no_of_reserved_spots}}</td>
                                <td>{{lot.no_of_available_spots}}</td>
                                <td><button class="btn btn-dark" @click="lot_details(lot.id)">Click Here</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            name: '',
            email: '',
            search_key: '',
            parking_lots: []
        }
    },
    computed: {
        search_parking_lots: function() {
            if (this.search_key === '') {
                return this.parking_lots
            }
            else {
                return this.parking_lots.filter(lot => 
                    lot.prime_location_name.toLowerCase().includes(this.search_key.toLowerCase())
                )
            }
        }
    },
    mounted: async function() {
        if (localStorage.getItem('token')) {
            const res = await fetch('/api/user_detail', {
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
                    this.get_parking_lots()
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
        get_parking_lots: async function() {
            const res = await fetch('/api/parking_lots_details', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem('token')
                },
            })
            if (res.status === 200) {
                this.parking_lots = await res.json()
            }
            else {
                alert(`Status ${res.status}: Unable to load parking_lots`)
            }
        },
        lot_details: function(id) {
            this.$router.push(`/parking_lot/${id}`)
        },
        create_lot: function() {
            this.$router.push('/create_lot')
        },
        users_list: function() {
            this.$router.push('/users_list')
        },
        analytics: function() {
            this.$router.push('/admin_analytics')
        },
        logout: async function() {
            const res = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem('token')
                }
            })
            if (res.status === 200) {
                localStorage.removeItem('token')
                const data = await res.json()
                alert(`Status 200: ${data.message}`)
                this.$router.push('/login')
            }
            else {
                alert(`Status ${res.status}: Something went wrong.`)
            }
        }
    }
}