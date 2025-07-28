import admin from 'firebase-admin'
import dotenv from 'dotenv'

dotenv.config()

// Firebase Admin SDK configuration
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID || "clinic-management-demo",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\nxhXBaaxLO3NoFnXyOP5u9yBVkU4s2uT5Q6rlzfEtYiYGy/WXfnyQXVl8H4OyQPAv\nzUN4C2C2I/X1Lxw2Cv1Ok+vwzgNaFHNxuqT5WBRZ4axHyqJVJ2+w+D+PAXlUhHGn\nI5F5xXuIPgXlXa+LuFiCOWBw+NFmiK9reRhcCqfMYILE9aDaclQg+bImFdX8i9YB\nxoR/BQVxPVD4xeMdMXrr/xRg6x3iBsi+c4VtmSxdhMiMVhvC+ExHFu8Rkj/jnmL+\nOBYfEXEm5fMORrMi9q1rS4SEQYn2XmRTyI4Q5YjvhoN1SjgE5XTBgkXvAGlddkR+\nwgyxGVRzAgMBAAECggEBALc5lAnuufd8nIcLKI9/Q5tyYUdekHh0d3tsNHFbcjaD\ncRJ8/gqmn3xXRtVb6Cl+Ol6naZ+QnS1SE8Rw8Tnvs8KKvVqcvdBiM2HGsOwPei9m\nEeJl+vOHnlIXhF0pjywL5IHdvloqbyGzc7XnVjrBMvkeBePGWn2+fzjYHqTU+Tts\n+yGE3uvBdDxR5A4BtTHoW+KI7UpCn+jlgxe3eJkzBdvkxOqidnp/DQCe1MVH+i4G\nkTG+Yb7G9oyWS6y8ovLt0bLzKyAHYI+QjdOL7EkzhrFb+_+XM0eCuNzTRRE2isHg\n9f3EAD3sNPkqaAdHkMaHMhkBBFrAcfSu1WwbXhQz+9ECgYEA4aPY7bCWGm01vQ2O\nK2cc7jyB02KxMaI1/yoiCwjjEeelIcmNZ9ENdp/XtmIRMspr1qR3YuAyy7hI8uyp\nAiAXnWfh3qiUWBfC2EuFishjHpkkXDbKDe/jMUc4MQziWRpoFwjIHiyGHyeh7VFz\nrw0Uy5vSyaR5OLrtMJPVYuNBVw8CgYEA1AhqJxTdkgmqgEH91vaWe+l5+SjnSBXv\n+H/GWg+FNAJeWCHrPrHMBjGWVqFTWcB0U4m/KLVPZtlBBxs1+VtQeOfNoTskuKDS\nCxQoLGAcQA2u+_jgxGNE2W2EN9EoJ4CdFzrbjHBdcwz8+ZqTzs7hZ6REBb7FbsOh\nXBedWVhFBrECgYEAvpnG2C8THGpJknXhP9BHorpb+CRzI4zSWxQAw4SWjbYwON4F\nXjEzAKhTbJdwMBaQHQkQiS3t/d3yOJrNGxPtMp/f/TM+zGvs2YFQYb8fFzY5N6uY\nwjvqAzFQsNfrvQMxAm1oEAoOmFg+VKaXJnuRiXo\n-----END PRIVATE KEY-----\n",
  client_email: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-xxxxx@clinic-management-demo.iam.gserviceaccount.com",
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
  token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
}

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || "clinic-management-demo"
  })
}

export const auth = admin.auth()
export const firestore = admin.firestore()

export default admin