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
            <div class="mb-4">
                <div class="container-fluid bg-dark text-light pt-2 pb-2">
                    <div class="row">
                        <div class="col-12">
                            <h3 class="text-center">SPOT DETAILS</h3>
                        </div>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="table text-center table-bordered table-info table-hover">
                        <thead>
                            <tr>
                                <th>SPOT ID</th>
                                <th>SPOT STATUS</th>
                                <th>LOT ID</th>
                                <th>PRIME LOCATION NAME</th>
                                <th>PRICE PER MINUTE</th>
                                <th>PINCODE</th>
                                <th>ADDRESS</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{{spot_id}}</td>
                                <td>{{status}}</td>
                                <td>{{lot_id}}</td>
                                <td>{{prime_location_name}}</td>
                                <td>{{price_per_minute}}</td>
                                <td>{{pincode}}</td>
                                <td>{{address}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="mb-3">
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
                                <th>BOOKING ID</th>
                                <th>USER ID</th>
                                <th>VEHICLE NUMBER</th>
                                <th>PRICE PER MINUTE</th>
                                <th>BOOKING TIMESTAMP</th>
                                <th>PARKING TIMESTAMP</th>
                                <th>LEAVING TIMESTAMP</th>
                                <th>PARKING COST</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{{current_parking_details.booking_id}}</td>
                                <td>{{current_parking_details.user_id}}</td>
                                <td>{{current_parking_details.vehicle_no}}</td>
                                <td>{{current_parking_details.price_per_minute}}</td>
                                <td>{{current_parking_details.booking_timestamp}}</td>
                                <td>{{current_parking_details.parking_timestamp}}</td>
                                <td>{{current_parking_details.leaving_timestamp}}</td>
                                <td>{{current_parking_details.parking_cost}}</td>
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
            spot_id: Number(this.$route.params.id),
            lot_id: null,
            status: null,
            prime_location_name: null,
            price_per_minute: null,
            pincode: null,
            address: null,
            current_parking_details: {}
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
                    this.read_spot()
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
        read_spot: async function() {
            const res = await fetch(`/api/admin/parking_spot_details/${this.spot_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem('token')
                }
            })
            if (res.status === 200) {
                const data = await res.json()
                this.lot_id = data.lot_id
                this.status = data.status
                this.prime_location_name = data.prime_location_name
                this.price_per_minute = data.price_per_minute
                this.pincode = data.pincode
                this.address = data.address
                this.current_parking_details = data.current_parking_details
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
        admin_dashboard: function() {
            this.$router.push('/admin')
        }
    }
}