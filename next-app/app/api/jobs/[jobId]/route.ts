import { NextResponse } from "next/server";
import prisma from "@/app/lib/db";

// The second argument to the GET function contains the params.
// We destructure it to get the `params` object.
export async function GET(
  request: Request,
  { params }: {params: { jobId: string } }
) {
  try {
    // The jobId is directly available on the params object. No 'await' is needed here.
    const jobId = params.jobId;

    const job = await prisma.jobs.findUnique({
      where: {
        jobId: jobId,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error: any) {
    // It's helpful to log the specific job ID that failed.
    console.error(`[API Get Job ${params.jobId}] Error:`, error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
