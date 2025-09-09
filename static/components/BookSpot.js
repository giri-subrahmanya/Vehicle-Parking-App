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
                    <button class="m-2 btn btn-success" @click='user_dashboard'>DASHBOARD</button>
                </div>
            </div>
        </div>
        <div class="p-4">
            <div class="mb-4">
                <div class="container-fluid bg-dark text-light pt-2 pb-2">
                    <div class="row">
                        <div class="col-12">
                            <h3 class="text-center">CURRENT PARKING DETAILS</h3>
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
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="mb-3">
                <div class="d-flex justify-content-center">
                    <div class="card text-dark border-dark"
                        style="background-color: rgba(97, 202, 247, 1);">
                        <div class="card-header text-white bg-dark">
                            <h5>BOOK SPOT</h5>
                        </div>
                        <div class="card-body">
                            <form @submit.prevent="book_spot" class="mb-3">
                                <div class="mb-3">
                                    <label for="vehicle_no" class="form-label">
                                        <h5>VEHICLE NUMBER</h5>
                                    </label>
                                    <input type="text" id="vehicle_no" v-model="vehicle_no" class="form-control" required
                                        pattern="^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$">
                                    <div class="form-text">Vehicle Number must satisfy the pattern
                                        <b>"^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$"</b></div>
                                </div>
                                <button type="submit" class="btn btn-danger">BOOK SPOT</button>
                            </form>
                        </div>
                    </div>
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
            prime_location_name: null,
            price_per_minute: null,
            number_of_spots: null,
            pincode: null,
            address: null,
            no_of_reserved_spots: null,
            no_of_available_spots: null,
            vehicle_no: null
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
                if (data.role === 'user') {
                    this.name = data.name
                    this.email = data.email
                    this.read_lot()
                }
                else if (data.role === 'admin') {
                    this.$router.push('/admin')
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
        read_lot: async function() {
            const res = await fetch(`/api/user/read_lot/${this.lot_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem('token')
                }
            })
            if (res.status === 200) {
                const data = await res.json()
                this.prime_location_name = data.prime_location_name
                this.price_per_minute = data.price_per_minute
                this.number_of_spots = data.number_of_spots
                this.pincode = data.pincode
                this.address = data.address
                this.no_of_reserved_spots = data.no_of_reserved_spots
                this.no_of_available_spots = data.no_of_available_spots
                if (this.no_of_available_spots <= 0) {
                    alert('Parking spots are not currently available at this parking lot. Please try later.')
                    this.$router.push('/user')
                }
            }
            else if (res.status === 400) {
                try {
                    const data = await res.json()
                    alert(`Status 400: ${data.message}`)
                    this.$router.push('/user')
                }
                catch (e) {
                    alert('Status 400: Something went wrong.')
                    this.$router.push('/user')
                }
            }
            else {
                alert(`Status ${res.status}: Something went wrong.`)
                    this.$router.push('/user')
            }
        },
        book_spot: async function() {
            const res = await fetch('/api/user/book_spot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem('token')
                },
                body: JSON.stringify({lot_id: this.lot_id, vehicle_no: this.vehicle_no})
            })
            if (res.status === 200) {
                const data = await res.json()
                alert (`Status 200: ${data.message}`)
                this.$router.push('/user')
            }
            else if (res.status === 400) {
                try {
                    const data = await res.json()
                    alert(`Status 400: ${data.message}`)
                    this.$router.push('/user')
                }
                catch (e) {
                    alert('Status 400: Something went wrong.')
                    this.$router.push('/user')
                }
            }
            else {
                alert(`Status ${res.status}: Something went wrong.`)
                    this.$router.push('/user')
            }
        },
        user_dashboard: function() {
            this.$router.push('/user')
        }
    }
}