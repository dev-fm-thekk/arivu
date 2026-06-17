'use client';

import { SignInAction } from "@/services/auth/actions";

export default function Button() {
    return <button onClick={async () => await SignInAction()}>Sign In With google</button>
}