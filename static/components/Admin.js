export default {
    template: `
    <div>
        
        <div class="p-4 text-primary">
            <div>
                <div class="container-fluid bg-dark  pt-2 pb-2">
                    <div class="row">
                        <div >
                            <h3 class="text-center">PARKING LOTS</h3>
                        </div>
                        
                    </div>
                </div>
                
            </div>
            <div>
            </div>
        </div>
        <div class="container-fluid bg-dark ">
            <div class="row pt-2 pb-2 ps-4 pe-4  align-items-center">
                <div class="col">
                    <h4>NAME : {{name}}</h4>
                    <h4>EMAIL : {{email}}</h4>
                </div>
            </div>
        </div>
        <div class="col d-flex justify-content-end align-items-bottom">
                    <button class="m-2 btn btn-warning" @click="create_lot">CREATE LOT</button>
                    <button class="m-2 btn btn-warning" @click="users_list">LIST OF USERS</button>
                    <button class="m-2 btn btn-warning" @click="analytics">ANALYTICS</button>
                    <button class="m-2 btn btn-warning" @click='logout'>LOGOUT</button>
                </div>
        <div class="container">
        <div class="row">
        <div class="col-3">
                            <input class="bg-warning" type="text" v-model="search_key" class="form-control"
                                placeholder="search prime_location_name">
                        </div>

        </div>
        </div>
        <div class="table-responsive">
                    <table class="table text-center table-bordered table-info table-hover">
                        <thead >
                            <tr>
                                <th class="text-primary">ID</th>
                                <th class="text-primary">PRIME LOCATION NAME</th>
                                <th class="text-primary">PRICE PER MINUTE</th>
                                <th class="text-primary">NUMBER OF SPOTS</th>
                                <th class="text-primary">PINCODE</th>
                                <th class="text-primary">ADDRESS</th>
                                <th class="text-primary">NUMBER OF RESERVED SPOTS</th>
                                <th class="text-primary">NUMBER OF AVAILABLE SPOTS</th>
                                <th class="text-primary">MORE DETAILS</th>
                            </tr>
                        </thead>
                        <tbody class="text-primary">
                            <tr v-for="lot in search_parking_lots">
                                <td class="text-primary">{{lot.id}}</td>
                                <td class="text-primary">{{lot.prime_location_name}}</td>
                                <td class="text-primary">{{lot.price_per_minute}}</td>
                                <td class="text-primary">{{lot.number_of_spots}}</td>
                                <td class="text-primary">{{lot.pincode}}</td>
                                <td class="text-primary">{{lot.address}}</td>
                                <td class="text-primary">{{lot.no_of_reserved_spots}}</td>
                                <td class="text-primary">{{lot.no_of_available_spots}}</td>
                                <td class="text-primary"><button class="btn btn-dark" @click="lot_details(lot.id)">Click Here</button></td>
                            </tr>
                        </tbody>
                    </table>
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