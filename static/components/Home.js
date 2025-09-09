export default {
    template: `
    <div>
        <div class="container-fluid bg-dark text-light">
            <div class="row pt-2 pb-2 ps-4 pe-4  align-items-center">
                <div class="col-9 d-flex justify-content-center">
                    <h1>PARK VEHICLE</h1>
                </div>
                <div class="col-3 d-flex justify-content-end">
                    <button class="m-2 btn btn-success" @click='login'>LOGIN</button>
                    <button class="m-2 btn btn-success" @click='register'>REGISTER</button>
                </div>
            </div>
        </div>
        <div class="p-4">
        </div>
    </div>
    `,
    methods: {
        login: function () {
            this.$router.push('/login')
        },
        register: function () {
            this.$router.push('/register')
        }
    }
}