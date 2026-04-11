class ApiError extends Error {
    constructor(
        statusCode,
        message="something wen wrong",
        errors = [],
        stack= ""

    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.succes = false
        this.errors =errors

        if (stack) {
            this.stack=stack
        } else {
            Error.captureStackTrack(this,this.constructor)
        }
    }
}