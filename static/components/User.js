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
                    <button class="m-2 btn btn-success" @click='analytics'>ANALYTICS</button>
                    <button class="m-2 btn btn-success" @click='logout'>LOGOUT</button>
                </div>
            </div>
        </div>
        <div class="p-4">
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
                                <th>SPOT ID</th>
                                <th>VEHICLE NUMBER</th>
                                <th>PRICE PER MINUTE</th>
                                <th>PRIME LOCATION NAME</th>
                                <th>ADDRESS</th>
                                <th>PINCODE</th>
                                <th>STATUS</th>
                                <th>BOOKING TIMESTAMP</th>
                                <th>PARKING TIMESTAMP</th>
                                <th>LEAVING TIMESTAMP</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="booked_spot in current_parking_details">
                                <td>{{booked_spot.booking_id}}</td>
                                <td>{{booked_spot.spot_id}}</td>
                                <td>{{booked_spot.vehicle_no}}</td>
                                <td>{{booked_spot.price_per_minute}}</td>
                                <td>{{booked_spot.prime_location_name}}</td>
                                <td>{{booked_spot.address}}</td>
                                <td>{{booked_spot.pincode}}</td>
                                <td>{{booked_spot.status}}</td>
                                <td>{{booked_spot.booking_timestamp}}</td>
                                <td>{{booked_spot.parking_timestamp}}</td>
                                <td>{{booked_spot.leaving_timestamp}}</td>
                                <td>
                                    <button class="btn btn-dark" v-if="!booked_spot.parking_timestamp"
                                        @click="park_vehicle(booked_spot.booking_id)">
                                        PARK VEHICLE
                                    </button>
                                    <button class="btn btn-dark" v-else @click="vacate_vehicle(booked_spot.booking_id)">
                                        VACATE VEHICLE
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="mb-3">
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
                                <th>LOT ID</th>
                                <th>PRIME LOCATION NAME</th>
                                <th>PRICE PER MINUTE</th>
                                <th>PINCODE</th>
                                <th>ADDRESS</th>
                                <th>NUMBER OF SPOTS</th>
                                <th>NUMBER OF RESERVED SPOTS</th>
                                <th>NUMBER OF AVAILABLE SPOTS</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="lot in search_parking_lots">
                                <td>{{lot.id}}</td>
                                <td>{{lot.prime_location_name}}</td>
                                <td>{{lot.price_per_minute}}</td>
                                <td>{{lot.pincode}}</td>
                                <td>{{lot.address}}</td>
                                <td>{{lot.number_of_spots}}</td>
                                <td>{{lot.no_of_reserved_spots}}</td>
                                <td>{{lot.no_of_available_spots}}</td>
                                <td>
                                    <button class="btn btn-dark" v-if="lot.no_of_available_spots !==0" @click="book_spot(lot.id)">BOOK SPOT</button>
                                    <p v-else>TRY LATER</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="mb-3">
                <div class="container-fluid bg-dark text-light pt-2 pb-2">
                    <div class="row align-items-center">
                        <div class="col-9">
                            <h3 class="text-center">PARKING HISTORY</h3>
                        </div>
                        <div class="col-3 d-flex justify-content-end">
                            <button class="btn btn-info" @click="download_csv"><b>DOWNLOAD CSV</b></button>
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
                            <tr v-for="booked_spot in parking_history">
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
            search_key: '',
            parking_lots: [],
            current_parking_details: [],
            parking_history: []
        }
    },
    computed: {
        search_parking_lots: function () {
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
                if (data.role === 'user') {
                    this.name = data.name
                    this.email = data.email
                    this.fetch_data()
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
        fetch_data: async function () {
            const res1 = await fetch('/api/user/parking_details', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem('token')
                }
            })
            if (res1.status === 200) {
                const data = await res1.json()
                this.current_parking_details = data.current_parking_details,
                    this.parking_history = data.parking_history
            }
            else {
                alert(`Status ${res1.status}: Error in fetching the parking_details.`)
            }
            const res2 = await fetch('/api/parking_lots_details', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem('token')
                }
            })
            if (res2.status === 200) {
                this.parking_lots = await res2.json()
            }
            else {
                alert(`Status ${res2.status}: Error in fetching the parking_lots.`)
            }
        },
        park_vehicle: async function (id) {
            const res = await fetch('/api/user/park_in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem('token')
                },
                body: JSON.stringify({ booking_id: id })
            })
            if (res.status === 200) {
                await this.fetch_data()
                const data = await res.json()
                alert(`Status 200: ${data.message}`)
            }
            else if (res.status === 400) {
                try {
                    const data = await res.json()
                    alert(`Error 400: ${data.message}`)
                }
                catch (e) {
                    alert(`Error 400: Something went wrong.`)
                }
            }
            else {
                alert(`Error ${res.status}: Something went wrong.`)
            }
        },
        vacate_vehicle: async function (id) {
            const res = await fetch('/api/user/vacate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem('token')
                },
                body: JSON.stringify({ booking_id: id })
            })
            if (res.status === 200) {
                await this.fetch_data()
                const data = await res.json()
                alert(`Status 200: ${data.message}`)
            }
            else if (res.status === 400) {
                try {
                    const data = await res.json()
                    alert(`Error 400: ${data.message}`)
                }
                catch (e) {
                    alert(`Error 400: Something went wrong.`)
                }
            }
            else {
                alert(`Error ${res.status}: Something went wrong.`)
            }
        },
        download_csv: async function () {
            const res1 = await fetch('/api/user/csv_start', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem('token')
                }
            })
            if (res1.status === 200) {
                const data1 = await res1.json()
                const csv_id = data1.id
                var maxTries = 20
                console.log(1)
                while (maxTries > 0) {
                    console.log(2)
                    var res2 = await fetch(`/api/user/csv_status/${csv_id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authentication-Token': localStorage.getItem('token')
                        }
                    })
                    if (res2.status === 200) {
                        console.log(3)
                        var data2 = await res2.json()
                        var state = data2.state
                        if (state === 'SUCCESS') {
                            console.log(4)
                            break
                        }
                        else if (state == 'FAILURE') {
                            console.log(5)
                            alert('DOWNLOAD FAILED')
                            break
                        }
                        else {
                            console.log(6)
                            maxTries = maxTries - 1
                            await new Promise(r => setTimeout(r, 1000))
                        }
                    }
                    else {
                        console.log(7)
                        alert(`Status ${res2.status}: DOWNLOAD FAILED`)
                        this.$router.push('/user')
                    }
                }
                const res3 = await fetch(`/api/user/csv_status/${csv_id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': localStorage.getItem('token')
                    }
                })
                if (res3.status === 200) {
                    console.log(8)
                    var data3 = await res3.json()
                    if (data3.state === 'SUCCESS') {
                        console.log(9)
                        const res4 = await fetch(`/api/user/csv_download/${csv_id}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authentication-Token': localStorage.getItem('token')
                            }
                        })
                        if (res4.status === 200) {
                            console.log(10)
                            const blob = await res4.blob()
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `${this.email}_parking_history.csv`
                            a.style.display = 'none'
                            document.body.appendChild(a)
                            a.click()
                            a.remove()
                            URL.revokeObjectURL(url)
                        }
                        else {
                            console.log(11)
                            alert('DOWNLOAD FAILED')
                        }
                    }
                    else {
                        console.log(12)
                        alert('DOWNLOAD FAILED')
                    }
                }
                else {
                    console.log(13)
                    alert('DOWNLOAD FAILED')
                }
            }
            else {
                console.log(14)
                alert(`Status ${res1.status}: Something went wrong`)
            }
        },
        book_spot: function (id) {
            this.$router.push(`/book_spot/${id}`)
        },
        analytics: function () {
            this.$router.push('/user_analytics')
        },
        logout: async function () {
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