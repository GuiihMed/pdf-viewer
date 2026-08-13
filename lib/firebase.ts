import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'pdf-viewer-c4b04',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@pdf-viewer-c4b04.iam.gserviceaccount.com',
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDsPYE0cdSgFtT/\n/y6twCt8DYZGjm4vK2pMww6uW3z4RTQ0b++1HmpHzw7YWVWbqNu9PvWm+OobCRNZ\n6rDCsevWCs3Tizh6ZtVIbJJQYKlGPzYBPhoGBE3bjRO+LXbKqOUGYUKaS9UUdql1\ncWJT5prBUvWkqc1+TZ/WxMM2PuiS23HINVQ0f9hr1MjVcWl1wXc6XxY/5S9HR2D4\nE5ilpTW8aS7Yh9tijdWTr5YYII74d6udy3fBOyIG9MuvEQ8u62Xj+MGGa5ypqycg\nPyTwSE/DXBCymzU/jAVSGUzaHdF65hZ3qNEflWtBn0Oi2DC2WFpQ/k46ljKd1mso\n7UJ8SDfJAgMBAAECggEAE/4Tgmb0vdSY045aurEV7QJu/+cbW4oSzaq/QhGzhoZC\nyAJGGL+ZcnjLMpOC23DDoeUjYG1V0JJozRX/vgZVJVDWQOYaEj/EIoQvsLYxdSSx\n0xKYnLQ+C4vJpTFPSZDYCv1tp8Wto3T0W+BL2Dpek+hLqhMFtT/n/EK8G4ng4Fag\nyEMSacuLWkdUOVJwpMkx95rzfvpxlsjGmUkIVBKpBWWZY3LXDgPNr+3YS7Q4AKKJ\ntW7PGmvtVnKGEyHScBXx1CJn5aQWg0KOKm2nTKE/3yssBBmlJVXLJ/lEqh/QFdML\nObtJ627rCs09a6OvtiKFuD9m4aKZYUSMeQDQ62fLoQKBgQD/F+8CC8cyIwqLa/XL\n54y3IF7o4ZljcIzNnHJOEoJ4+O8UWt4WUZc+cysry7Og3Jq+eb8hAcVNl6VPVEQw\nP9XnZ+puCr8s+VAfS7dz0CVnYjgIOHnPCVGppOyn2x9ncWxW6Tf57aZikBtL3fH0\nMhxA2wKthbvF4exkfhNwQXPT8QKBgQDtFGtyR3bJrA3w5jobt1ELcIPKRZfZTmLn\nuw3h90NR8P57JF9x39jMSh1zcmyBUqNo9Ys8NVVG5jHuua5wOthW74feT4NlNOeb\nKkOZbwo/hEandBCcFwFdoyloOTAL9kqPyExejXuSlAfxxjW82onEDrBT4y889LDi\nPD6e7WEZWQKBgGKm3d7bsTh5hr1ujgtCTBASK8JCZPCo+TsXErmQvPaNxuAHWDYn\nbadQINT6HUjLp+ib6seYCLa+O8cXHpvORCoO7QGLlG2PKWZBAPx/9ccqm+LJ/ImN\n4BAMYR11R4rYuX5PCT/VoXAirPvFJKo8quKGEF4NBxY7DhG7FEdoeKPxAoGBAMra\nygUCePWerl8N33KPrFzpbRrJ6WAa3i4Bs6NBeuzGFDkxqik5q7tBP2nk4krVdtT8\nJKLjz4/Wr6rgXg3RjAL2+X6S8o7KcdImm6jRhidK+1mUyhGE7bo9PdTb+eyCVNIq\nRI4y6SVGXHXXb2ukYnTLTLy6i1TQ2fj6K2q5GnghAoGAKC7toMciqgZl2MqW/FBf\ney/gLzcc5iJBothPn+r3vRE/sSYSmBbNJ1Ie3CGZ1oIOe5LyHLw1GZeKW78DTzcA\nD0OtaHYv3MuqP8BBFQ2LOXN085INm2SSyEo2Nfp8+aOyWRMAVFNkVasaT12nOVAw\nx6p91UTPzcBmNzDHXZ3RHhY=\n-----END PRIVATE KEY-----\n`).replace(/\\n/g, '\n'),
};

const app = getApps().length === 0 ? initializeApp({ credential: cert(serviceAccount) }) : getApps()[0];

export const firestore = getFirestore(app);
