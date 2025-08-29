import { NextResponse } from "next/server";
import prisma from "@/app/lib/db";








export async function GET(
    request:Request,
    {params} :{params:{jobId:string}}
){

    try{
        const jobId = params.jobId


        const job = await prisma.jobs.findUnique({
            where:{
                jobId:jobId,
            }

        });

        if(!job){
            return NextResponse.json({
                error:"job not found",status:404
            })


        }

        return NextResponse.json(job)
    }
    catch (error: any) {
    console.error(`[API Get Job ${params.jobId}] Error:`, error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );


}