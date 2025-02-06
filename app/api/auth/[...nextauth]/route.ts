import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// NextAuth configuration
const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as const, 
    maxAge: 60 * 120,
  },
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.token = token.accessToken;  
        session.user.id = token.id;         
      }
      return session;
    },
    async jwt({ token, account, user }: { token: any; account: any; user: any }) {
      if (account) {
        token.accessToken = account.access_token;
        token.id = user.id; 
      }
      return token;
    },
  },
};

// Define GET and POST methods for Next.js 13+ API routes
export async function GET(req: any, res: any) {
  return NextAuth(req, res, authOptions);
}

export async function POST(req: any, res: any) {
  return NextAuth(req, res, authOptions);
}
