export default {
    template: `
    <div>
        <div class="container-fluid bg-dark text-light">
            <div class="row pt-2 pb-2 ps-4 pe-4  align-items-center">
                <div class="col-12 d-flex justify-content-center">
                    <h1>PARK VEHICLE</h1>
                </div>
            </div>
        </div>
        <div class="p-4">
            <div class="d-flex justify-content-center">
                <div class="card text-dark border-dark" style="background-color: rgba(97, 202, 247, 1);">
                    <div class="card-header text-white bg-dark">
                        <h5>LOGIN</h5>
                    </div>
                    <div class="card-body">
                        <form @submit.prevent="login" class="mb-3">
                            <div class="mb-3">
                                <label for="email" class="form-label">
                                    <h5>EMAIL</h5>
                                </label>
                                <input type="email" id="email" v-model="form.email" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label for="password" class="form-label">
                                    <h5>PASSWORD</h5>
                                </label>
                                <input type="password" id="password" v-model="form.password" class="form-control" required>
                            </div>
                            <button type="submit" class="btn btn-danger">LOGIN</button>
                        </form>
                        <p class="mb-1">Don't have an account? </p>
                        <p><a href="#/register" style="color: rgba(28, 57, 245, 1);" class="link-opacity-100">Click to register</a></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            form: {
                email: '',
                password: ''
            },
            query_registered: this.$route.query.regisered
        }
    },
    methods: {
        login: async function() {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(this.form)
            })
            if (res.status === 200) {
                const data = await res.json()
                localStorage.setItem('token', data.token)
                if (data.role === 'admin') {
                    this.$router.push('/admin')
                }
                else {
                    this.$router.push('user')
                }
            }
            else if (res.status === 400) {
                try {
                    const data = await res.json()
                    alert(`Error ${res.status}: ${data.message}`)
                } catch (e) {
                    alert(`Error ${res.status}: Something went wrong`)
                }
            }
            else {
                alert(`Error ${res.status}: Something went wrong`)
            }
        },
        register: function() {
            this.$router.push('/register')
        }
    }
}