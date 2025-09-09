export default {
    template: `
    <div>
        <div class="container-fluid bg-dark text-light mb-4">
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
        <div class="container-fluid d-flex align-items-center justify-content-center p-4">
            <div class="p-4">
                <div v-if="status" id="bar_chart"></div>
                <div v-else>No data to show</div> 
            </div>
        </div>
    </div> 
    `,
    data() {
        return {
            name: '',
            email: '',
            status: true,
            dataset: [],
            layout: {}
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
                    this.get_analytics()
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
        get_analytics: async function () {
            const res = await fetch('/api/admin/analytics', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem('token')
                },
            })
            if (res.status === 200) {
                const data = await res.json()
                if (Object.keys(data).length === 0) {
                    this.status = false
                }
                else {
                    this.status = true
                    this.dataset = [{
                        x: Object.keys(data),
                        y: Object.values(data),
                        type: 'bar',
                        text: Object.values(data).map(String),
                        marker: {
                            line: {
                                color: 'rgb(8,48,107)',
                                width: 1.5
                            }
                        }
                    }]
                    this.layout = {
                        title: {
                            text: 'BAR-CHART LOCATION COUNT'
                        },
                        xaxis: {
                            title: {
                                text: 'Location'
                            }
                        },
                        yaxis: {
                            title: {
                                text: 'Count'
                            }
                        }
                    }
                    Plotly.newPlot('bar_chart', this.dataset, this.layout)
                }
            }
            else {
                alert(`Status ${res.status}: Something went wrong.`)
                this.$router.push('/admin')
            }
        },
        admin_dashboard: function () {
            this.$router.push('/admin')
        }
    }
}