import { NextResponse } from "next/server";
import prisma from "@/app/lib/db";

import { Prisma } from "@prisma/client";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    // Await the params object before accessing its properties
    console.log("Entered in the [jobId] Api route for hourly chart data")
    const resolvedParams = await params;
    const jobId = resolvedParams.jobId;

    const statusCheck = await prisma.jobs.findUnique({
      where: {
        jobId: jobId,
      },
      select:{
        status:true
      }
    });

     if (!statusCheck) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }


    const selectFields:Prisma.JobsSelect = {
      jobId: true,
      status: true,
      city: true,
      createdAt: true,
      // Conditionally include result_data
      result_data: statusCheck.status === "COMPLETED"
    };
    


    const job = await prisma.jobs.findUnique({
      where: { jobId },
      select: selectFields
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
      console.error(`[API Get Job] Error:`, error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}