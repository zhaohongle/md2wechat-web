import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const themesDir = path.join(process.cwd(), 'lib', 'themes');
    const files = fs.readdirSync(themesDir).filter(f => f.endsWith('.json'));
    const themes = files.map(file => {
      const id = path.basename(file, '.json');
      const theme = JSON.parse(fs.readFileSync(path.join(themesDir, file), 'utf-8'));
      return {
        id,
        name: theme.displayName || theme.name || id,
        description: theme.description || '',
      };
    });
    return NextResponse.json({ success: true, data: themes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}
