export default {
    template: `
    <div>
        <div class="container-fluid bg-dark text-light">
            <div class="row pt-2 pb-2 ps-4 pe-4  align-items-center">
                <div class="col-9">
                    <h4>NAME : {{name}}</h4>
                    <h4>EMAIL : {{email}}</h4>
                </div>
                <div class="col-3 d-flex justify-content-end">
                    <button class="m-2 btn btn-success" @click="admin_dashboard">DASHBOARD</button>
                </div>
            </div>
        </div>
        <div class="p-4">
            <div class="d-flex justify-content-center">
                <div class="card text-dark border-dark" style="background-color: rgba(97, 202, 247, 1);">
                    <div class="card-header text-white bg-dark">
                        <h5>CREATE LOT</h5>
                    </div>
                    <div class="card-body">
                        <form @submit.prevent="create" class="mb-3">
                            <div class="mb-3">
                                <label for="prime_location_name" class="form-label"><h5>PRIME LOCATION NAME</h5></label>
                                <input type="text" id="prime_location_name" class="form-control" v-model="form.prime_location_name"
                                    pattern="^[A-Za-z][A-Za-z .]*$" required>
                                <div class="form-text">
                                    <b>prime_location_name</b> must begin with either uppercase or lowercase alphabet. This can be continued with uppercase or lowercase alphabets. Fullstop and spacebar are allowed
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="price_per_minute" class="form-label"><h5>PRICE PER MINUTE</h5></label>
                                <input type="number" id="price_per_minute" class="form-control" min="1" step="any" max="3"
                                    v-model="form.price_per_minute" required>
                                    <div class="form-text">
                                        <b>price_per_minute</b> must be a float greater than or equal to 1 and less than or equal to 3.
                                    </div>
                            </div>
                            <div class="mb-3">
                                <label for="number_of_spots" class="form-label"><h5>NUMBER OF SPOTS</h5></label>
                                <input type="number" id="number_of_spots" class="form-control" v-model="form.number_of_spots"
                                    min="0" step="1" max="30" required>
                                    <div class="form-text">
                                        <b>number_of_spots</b> must be an integer greater than or equal to 0 and less than or equal to 30.
                                    </div>
                            </div>
                            <div class="mb-3">
                                <label for="pincode" class="form-label"><h5>PINCODE</h5></label>
                                <input type="number" id="pincode" class="form-control" v-model="form.pincode" min="100000"
                                    max="999999" step="1" required>
                                    <div class="form-text">
                                        <b>pincode</b> must be an integer from 100000 to 999999..
                                    </div>
                            </div>
                            <div class="mb-3">
                                <label for="address" class="form-label"><h5>ADDRESS</h5></label>
                                <input type="text" id="address" class="form-control" v-model="form.address" minlength="1"
                                    maxlength="200" required>
                                    <div class="form-text">
                                        <b>address</b> should have atleast 1 character can have atmost 200 characters.
                                    </div>
                            </div>
                            <div class="d-flex justify-content-center">
                            <button type="submit" class="btn btn-danger">CREATE LOT</button>
                            </div>
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
            form: {
                prime_location_name: '',
                price_per_minute: '',
                number_of_spots: '',
                pincode: '',
                address: ''
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
        create: async function() {
            const res = await fetch('/api/admin/create_lot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem('token')
                },
                body: JSON.stringify(this.form)
            })
            if (res.status === 200) {
                const data = await res.json()
                alert(`Status ${200}: ${data.message}`)
                this.$router.push('/admin')
            }
            else if (res.status === 400) {
                try {
                    const data = await res.json()
                    alert(`Status 400: ${data.message}`)
                }
                catch (e) {
                    alert(`Status 400: Something went wrong. Try again`)
                }
            }
            else {
                alert(`Status ${res.status}: Something went wrong. Try again`)
            }

        },
        admin_dashboard: function() {
            this.$router.push('/admin')
        }
    }
}