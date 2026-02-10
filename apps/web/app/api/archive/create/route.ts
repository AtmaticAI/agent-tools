import { NextRequest, NextResponse } from 'next/server';
import { archive } from '@atmaticai/agent-tools-core';
import { guardTool } from '@/lib/tool-guard';
import { validateBase64Files } from '@/lib/validate-file';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('archive');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { files, compressionLevel } = body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: 'Files array required with at least one entry' },
        { status: 400 }
      );
    }

    const sizeError = validateBase64Files(files.map((f: { content: string }) => f.content));
    if (sizeError) return sizeError;

    const archiveFiles = files.map(
      (f: { path: string; content: string }) => ({
        path: f.path,
        content: Buffer.from(f.content, 'base64'),
      })
    );

    const result = await archive.create(archiveFiles, { compressionLevel });

    return NextResponse.json({
      data: Buffer.from(result).toString('base64'),
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
