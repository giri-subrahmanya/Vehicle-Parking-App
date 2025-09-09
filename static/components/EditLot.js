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
                                <h3 class="text-center">CURRENT DETAILS</h3>
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
                <div class="d-flex justify-content-center">
                    <div class="card text-dark border-dark" style="background-color: rgba(97, 202, 247, 1);">
                        <div class="card-header text-white bg-dark">
                            <h5>EDIT LOT</h5>
                        </div>
                        <div class="card-body">
                            <form @submit.prevent="edit_lot" class="mb-3">
                                <div class="mb-3">
                                    <label for="price_per_minute" class="form-label">
                                        <h5>PRICE PER MINUTE</h5>
                                    </label>
                                    <input type="number" id="price_per_minute" min="1" step="any" max="3" class="form-control"
                                        v-model="form.price_per_minute" required>
                                    <div class="form-text"><b>price_per_minute</b> must be a float greater than or equal to 1 and less than or equal to 3.</div>
                                </div>
                                <div class="mb-3">
                                    <label for="number_of_spots" class="form-label"><h5>NUMBER OF SPOTS</h5></label>
                                    <input type="number" id="number_of_spots" v-model="form.number_of_spots" class="form-control" :min="no_of_reserved_spots" max="30" step="1" required>
                                    <div class="form-text"><b>number_of_spots</b> cannot be less than number_of_reserved_spots.</div>
                                </div>
                                <button type="submit" class="btn btn-danger">EDIT LOT</button>
                            </form>
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
            prime_location_name: '',
            price_per_minute: '',
            number_of_spots: null,
            pincode: null,
            address: '',
            no_of_reserved_spots: null,
            no_of_available_spots: null,
            form: {
                lot_id: Number(this.$route.params.id),
                price_per_minute: '',
                number_of_spots: null
            }
        }
    },
    computed: {
        arr() {
            return Array.from(
                {length: 30 - this.no_of_reserved_spots + 1},
                (_, i) => this.no_of_reserved_spots + i
            )
        }
    }
    ,
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
        read_lot: async function() {
            const res = await fetch(`/api/admin/read_lot/${this.lot_id}`, {
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
                this.form.price_per_minute = data.price_per_minute
                this.form.number_of_spots = data.number_of_spots
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
        edit_lot: async function() {
            const res = await fetch('/api/admin/edit_lot', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem('token')
                },
                body: JSON.stringify(this.form)
            })
            if (res.status === 200) {
                const data = await res.json()
                alert(`Status 200: ${data.message}`)
                this.$router.push(`/parking_lot/${this.lot_id}`)
            }
            else if (res.status === 400) {
                try {
                    const data = await res.json()
                    alert(`Status 400: ${data.message}`)
                    this.$router.push(`/parking_lot/${this.lot_id}`)
                }
                catch (e) {
                    alert('Status 400: Something went wrong')
                    this.$router.push(`/parking_lot/${this.lot_id}`)
                }
            }
            else {
                alert(`Status ${res.status}: Something went wrong`)
                this.$router.push(`/parking_lot/${this.lot_id}`)
            }
        },
        admin_dashboard: function () {
            this.$router.push('/admin')
        },
    }
}