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
                        <h5>REGISTER</h5>
                    </div>
                    <div class="card-body">
                        <form @submit.prevent="register" class="mb-3">
                            <div class="mb-3">
                                <label for="name" class="form-label"><h5>NAME</h5></label>
                                <input type="text" id="name" v-model="form.name" class="form-control" pattern="^[A-Za-z][A-Za-z0-9]*" required>
                                <div class="form-text">Name should start with an alphabet and can have alphabets and numbers (0 to 9) later. Text can either be in uppercase or lowercase or both.</div>
                            </div>
                            <div class="mb-3">
                                <label for="email" class="form-label"><h5>EMAIL</h5></label>
                                <input type="email" id="email" v-model="form.email" class="form-control" pattern="^[a-z][a-z0-9]*@user.com" required>
                                <div class="form-text">Username must start with a lowercase alphabet and can have lowercase alphabet and numbers (0 to 9) later. Email should end with <b>'@user.com'</b></div>
                            </div>
                            <div class="mb-3">
                                <label for="password" class="form-label"><h5>PASSWORD</h5></label>
                                <input type="password" id="password" v-model="form.password" class="form-control" minlength="6" required>
                                <div class="form-text">Minimum of six charecters needed for password.</div>
                            </div>
                            <button type="submit" class="btn btn-danger">REGISTER</button>
                        </form>
                        <p class="mb-1">Have an account? </p>
                        <p><a href="#/login" style="color: rgba(28, 57, 245, 1);" class="link-opacity-100">Click to login</a></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            form: {
                name: '',
                email: '',
                password: ''
            }
        }
    },
    methods: {
        register: async function() {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(this.form)
            })
            if (res.status === 200) {
                const data = await res.json()
                alert(`Status 200: ${data.message}`)
                this.$router.push('/login')
            }
            else if (res.status === 400) {
                try {
                    const data = await res.json()
                    alert(`Error ${res.status}: ${data.message}`)
                } catch (e) {
                    alert(`Error ${res.status}: Something went wrong.`)
                }
            }
            else {
                alert(`Error ${res.status}: Something went wrong.`)
            }
        },
        login: function() {
            this.$router.push('login')
        }
    }
}