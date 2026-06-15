import 'dotenv/config'
import { emailManager } from './modules/auth/email/email.manager'

const run = async () => {
    const result = await emailManager.sendEmail(
        'djonesdavid01@gmail.com',
        'Test email',
        '<h1>Email works 🚀</h1>'
    )

    console.log(result)
}

run()