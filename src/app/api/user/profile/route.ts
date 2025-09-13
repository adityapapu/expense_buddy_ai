import { getUserProfile, updateUserProfile } from "@/server/actions/userActions";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getUserProfile();
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const user = await updateUserProfile(body);
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}