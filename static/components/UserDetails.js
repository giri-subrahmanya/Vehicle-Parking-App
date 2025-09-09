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
                    <button class="m-2 btn btn-success" @click="users_list">LIST OF USERS</button>
                </div>
            </div>
        </div>
        <div class="p-4">
            <div class="container-fluid bg-dark text-light pt-2 pb-2">
                <div class="row">
                    <div class="col-12">
                        <h3 class="text-center">USER DETAILS</h3>
                    </div>
                </div>
            </div>
            <div class="table-responsive mb-4">
                <table class="table text-center table-bordered table-info table-hover">
                    <thead>
                        <tr>
                            <th>USER ID</th>
                            <th>USER NAME</th>
                            <th>USER EMAIL</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{{user_id}}</td>
                            <td>{{user_name}}</td>
                            <td>{{user_email}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div>
                <div class="container-fluid bg-dark text-light pt-2 pb-2">
                    <div class="row">
                        <div class="col-12">
                            <h3 class="text-center">PARKING HISTORY</h3>
                        </div>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="table text-center table-bordered table-info table-hover">
                        <thead>
                            <tr>
                                <th>BOOKING ID</th>
                                <th>VEHICLE NUMBER</th>
                                <th>PRICE PER MINUTE</th>
                                <th>PRIME LOCATION NAME</th>
                                <th>ADDRESS</th>
                                <th>PINCODE</th>
                                <th>BOOKING TIMESTAMP</th>
                                <th>PARKING TIMESTAMP</th>
                                <th>LEAVING TIMESTAMP</th>
                                <th>PARKING COST</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="booked_spot in parking_details">
                                <td>{{booked_spot.booking_id}}</td>
                                <td>{{booked_spot.vehicle_no}}</td>
                                <td>{{booked_spot.price_per_minute}}</td>
                                <td>{{booked_spot.prime_location_name}}</td>
                                <td>{{booked_spot.address}}</td>
                                <td>{{booked_spot.pincode}}</td>
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
            user_id: this.$route.params.id,
            user_name: '',
            user_email: '',
            parking_details: null
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
                    this.get_user_details()
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
        get_user_details: async function() {
            const res = await fetch(`/api/admin/user_details/${this.user_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem('token')
                }
            })
            if (res.status === 200) {
                const data = await res.json()
                this.user_name = data.user_name
                this.user_email = data.user_email
                this.parking_details = data.parking_details

            }
            else if (res.status === 400) {
                try {
                    const data = await res.json()
                    alert(`Error 400: ${data.message}`)
                    this.$router.push('/admin')
                }
                catch (e) {
                    alert('Error 400: Something went worng.')
                    this.$router.push('/admin')   
                }
            }
            else {
                alert(`Error ${res.status}: Something went worng.`)
                    this.$router.push('/admin')
            }
        },
        admin_dashboard: function () {
            this.$router.push('/admin')
        },
        users_list: function() {
            this.$router.push('/users_list')
        }
    }
}