import { NextResponse } from "next/server";
import prisma from "@/app/lib/db";

// The second argument to the GET function contains the params.
// We destructure it to get the `params` object.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    // Await the params object before accessing its properties
    console.log("Entered in the [jobId] Api route for hourly chart data")
    const resolvedParams = await params;
    const jobId = resolvedParams.jobId;

    const job = await prisma.jobs.findUnique({
      where: {
        jobId: jobId,
      },
      select: {
        jobId: true,
        city: true,
        status: true,
        result_data: true,  // ✅ Make sure to include result_data
        createdAt: true,
      }
    });
    
    console.log("Complete job data:", job)

    if (!job) {
      return NextResponse.json(
        { error: "Job not found"},
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error: any) {
    // It's helpful to log the specific job ID that failed.
    console.error(`[API Get Job] Error:`, error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}