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
            <div class="mb-3">
                <div class="container-fluid bg-dark text-light pt-2 pb-2">
                    <div class="row">
                        <div class="col-12">
                            <h3 class="text-center">PARKING LOTS</h3>
                        </div>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="table text-center table-bordered table-info table-hover">
                        <thead>
                            <tr>
                                <th>LOT ID</th>
                                <th>PRIME LOCATION NAME</th>
                                <th>PRICE PER MINUTE</th>
                                <th>NUMBER OF SPOTS</th>
                                <th>PINCODE</th>
                                <th>ADDRESS</th>
                                <th>NUMBER OF RESERVED SPOTS</th>
                                <th>NUMBER OF AVAILABLE SPOTS</th>
                                <th>EDIT LOT</th>
                                <th v-if="no_of_reserved_spots === 0">DELETE LOT</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{{lot_id}}</td>
                                <td>{{prime_location_name}}</td>
                                <td>{{price_per_minute}}</td>
                                <td>{{number_of_spots}}</td>
                                <td>{{pincode}}</td>
                                <td>{{address}}</td>
                                <td>{{no_of_reserved_spots}}</td>
                                <td>{{no_of_available_spots}}</td>
                                <td><button class="btn btn-dark" @click="edit_lot">EDIT LOT</button></td>
                                <td v-if="no_of_reserved_spots === 0"><button class="btn btn-dark"
                                        @click="delete_confirm">DELETE LOT</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="mb-3">
                <div class="container-fluid bg-dark text-light pt-2 pb-2">
                    <div class="row align-items-center">
                        <div class="col-9">
                            <h3 class="text-center">PARKING SPOTS</h3>
                        </div>
                        <div class="col-3">
                            <select v-model="search_key">
                                <option>all</option>
                                <option>available</option>
                                <option>booked</option>
                                <option>occupied</option>
                                <option>booked and occupied</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="table text-center table-bordered table-info table-hover">
                        <thead>
                            <tr>
                                <th>SPOT ID</th>
                                <th>STATUS</th>
                                <th>MORE DETAILS</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="spot in search_parking_spots">
                                <td>{{spot.spot_id}}</td>
                                <td>{{spot.status}}</td>
                                <td>
                                    <button class="btn btn-dark" v-if="spot.status === 'booked' || spot.status === 'occupied'" @click="parking_spot_details(spot.spot_id)">Click Here</button>
                                    <h6 v-else>--</h6>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="mb-3">
                <div class="container-fluid bg-dark text-light pt-2 pb-2">
                    <div class="row align-items-center">
                        <div class="col-12">
                            <h3 class="text-center">PARKING HISTORY</h3>
                        </div>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="table text-center table-bordered table-info table-hover">
                        <thead>
                            <tr>
                                <th>USER ID</th>
                                <th>PRICE PER MINUTE</th>
                                <th>VEHICLE NUMBER</th>
                                <th>BOOKING TIMESTAMP</th>
                                <th>PARKING TIMESTAMP</th>
                                <th>LEAVING TIMESTAMP</th>
                                <th>PARKING COST</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="booked_spot in parking_history">
                                <td>{{booked_spot.user_id}}</td>
                                <td>{{booked_spot.price_per_minute}}</td>
                                <td>{{booked_spot.vehicle_no}}</td>
                                <td>{{booked_spot.booking_timestamp}}</td>
                                <td>{{booked_spot.parking_timestamp}}</td>
                                <td>{{booked_spot.leaving_timestamp}}</td>
                                <td>{{booked_spot.parking_cost}}</td>
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
            lot_id: Number(this.$route.params.id),
            search_key: 'all',
            prime_location_name: '',
            price_per_minute: '',
            number_of_spots: null,
            pincode: null,
            address: '',
            no_of_reserved_spots: null,
            no_of_available_spots: null,
            parking_spots: [],
            parking_history: []
        }
    },
    computed: {
        search_parking_spots: function() {
            if (this.search_key === 'all') {
                return this.parking_spots
            }
            else if (this.search_key === 'available'){
                return this.parking_spots.filter(spot => spot.status === 'available')
            }
            else if (this.search_key === 'booked'){
                return this.parking_spots.filter(spot => spot.status === 'booked')
            }
            else if (this.search_key === 'occupied'){
                return this.parking_spots.filter(spot => spot.status === 'occupied')
            }
            else if (this.search_key === 'booked and occupied'){
                return this.parking_spots.filter(spot => spot.status === 'booked' || spot.status === 'occupied')
            }
            else {
                return this.parking_spots
            }
        }
    },
    mounted: async function () {
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
                    this.read_lot()
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
        read_lot: async function () {
            const res = await fetch(`/api/admin/read_lot/${this.lot_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem('token')
                }
            })
            console.log(res)
            if (res.status === 200) {
                const data = await res.json()
                this.prime_location_name = data.prime_location_name
                this.price_per_minute = data.price_per_minute
                this.number_of_spots = data.number_of_spots
                this.pincode = data.pincode
                this.address = data.address
                this.no_of_reserved_spots = data.no_of_reserved_spots
                this.no_of_available_spots = data.no_of_available_spots
                this.parking_spots = data.parking_spots
                this.parking_history = data.parking_history
            }
            else {
                try {
                    const data = await res.json()
                    alert(`${res.status}: ${data.message}`)
                    this.$router.push('/admin')
                }
                catch (e) {
                    alert(`${res.status}: Something went wrong.`)
                    this.$router.push('/admin')
                }
            }
        },
        edit_lot: function () {
            this.$router.push(`/edit_lot/${this.lot_id}`)
        },
        delete_lot: async function () {
            const res = await fetch(`/api/admin/delete_lot`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem('token')
                },
                body: JSON.stringify({ lot_id: this.lot_id })
            })
            if (res.status === 200) {
                const data = await res.json()
                alert(`Status 200: ${data.message}`)
                this.$router.push('/admin')
            }
            else if (res.status === 400) {
                try {
                    const data = await res.json()
                    alert(`Status 400: ${data.message}`)
                    this.$router.push('/admin')
                }
                catch (e) {
                    alert('Status 400: Something went wrong.')
                    this.$router.push('/admin')
                }
            }
            else {
                alert(`Status ${res.status}: Something went wrong.`)
                this.$router.push('/admin')
            }
        },
        parking_spot_details: function (spot_id) {
            this.$router.push(`/parking_spot/${spot_id}`)
        },
        admin_dashboard: function () {
            this.$router.push('/admin')
        },
        delete_confirm: function () {
            if (confirm('Are you sure of delting the lot?')) {
                this.delete_lot()
            }
        }
    }
}