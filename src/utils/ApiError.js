class ApiError extends Error {
    constructor(
        statusCode,
        message="something wen wrong",
        errors = [],
        statck= ""

    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.succes = false
        this.errors =errors

        if (statck) {
            this.statck=statck
        } else {
            Error.captureStackTrack(this,this.constructor)
        }
    }
}