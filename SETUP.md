# healthpill — 신규 사이트 구축 가이드

> 짐스캐너(`C:\Web\jimscanner\jimpass-agent-platform`) 와 **동일한 인프라 패턴**(Next.js 16 + Supabase + Vercel + GitHub) 으로 healthpill 신규 사이트를 부트스트랩하기 위한 단계별 셋업 문서.
> 작성일: 2026-04-29

---

## 0. 사이트 개요 (예시 — 실제 방향 확정 시 수정)

| 항목 | 값 |
|------|----|
| 프로젝트명 (코드) | `healthpill` |
| 로컬 경로 | `C:\Web\healthpill` |
| GitHub 레포 | `https://github.com/anteam7/healthpill` (제안 — 짐스캐너와 동일 org `anteam7`) |
| Vercel 프로젝트 | `healthpill` |
| 도메인 (예시) | `https://www.healthpill.co.kr` (실제 도메인 결정 후 변경) |
| Supabase 프로젝트 (신규) | 신규 생성 — Region `ap-northeast-2 (Seoul)` |
| 운영자 이메일 | `anseunghyok@gmail.com` (관리자 화이트리스트) |
| 보호 책임자 이메일 | `somonday@gmail.com` (개인정보처리방침/이용약관 문의처) |

---

## 1. 기술 스택 (짐스캐너 동일 미러링)

| 레이어 | 기술 | 버전 (jimscanner 기준) |
|--------|------|-------|
| 프레임워크 | Next.js (App Router) | `16.1.6` |
| UI | React + Tailwind CSS v4 + shadcn/ui + Radix UI | React `19.2.3`, tailwindcss `^4`, shadcn `^3.8.5`, radix-ui `^1.4.3` |
| 언어 | TypeScript | `^5` |
| DB / Auth | Supabase (Postgres) | `@supabase/ssr ^0.8.0`, `@supabase/supabase-js ^2.98.0` |
| 호스팅 / Cron | Vercel | `@vercel/analytics ^1.6.1`, `@vercel/speed-insights ^2.0.0` |
| 분석 | GA4 + Google Search Console | `@google-analytics/data ^5.2.1`, `googleapis ^171.4.0` |
| 마크다운 렌더 | react-markdown + remark-gfm | `^10.1.0` / `^4.0.1` |
| 아이콘 / 지도 | lucide-react / leaflet (필요 시 제거) | `^0.575.0` / `^1.9.4` |

> ⚠️ Next.js 16 / React 19 는 캐시 컴포넌트, Server Components 기본값 등 지난해 대비 변화가 큼. 빌드 검증(`npm run build`)을 작업 단위마다 돌리는 짐스캐너 규칙 그대로 적용.

---

## 2. 1단계 — 로컬 프로젝트 초기화

`C:\Web\healthpill` 디렉터리는 이미 비어있는 상태. 짐스캐너에서 검증된 명령으로 부트스트랩.

```bash
cd C:/Web/healthpill

# Next.js 16 신규 프로젝트 (App Router, TypeScript, Tailwind, src 디렉터리)
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*"

# 짐스캐너와 동일한 의존성 추가
npm install @supabase/ssr @supabase/supabase-js @vercel/analytics @vercel/speed-insights \
  @tailwindcss/typography lucide-react react-markdown remark-gfm \
  class-variance-authority clsx tailwind-merge radix-ui

# (필요 시) GA4·GSC, 시장 시그널, 시뮬레이터 의존성
npm install @google-analytics/data googleapis pg xlsx leaflet react-leaflet

# shadcn/ui 초기화
npx shadcn@latest init
```

폴더 구조 (짐스캐너 미러링):

```
C:\Web\healthpill\
├── .env.local              # 비밀키 (절대 커밋 금지)
├── .gitignore              # 짐스캐너 .gitignore 그대로 복사 (아래 6장 참조)
├── AGENTS.md               # 하네스 목차
├── CLAUDE.md               # 하네스 규칙
├── README.md
├── components.json         # shadcn 설정
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── vercel.json             # cron 정의 (필요 시)
├── public/
├── docs/                   # 하네스 지식 (architecture/database/tech-stack/phase-roadmap)
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   └── lib/
│       ├── supabase.ts
│       └── utils.ts
├── supabase/
│   └── schema.sql          # 신규 스키마 (10장 템플릿 참조)
└── scripts/
    └── apply-sql.mjs       # DDL 자동 적용 (짐스캐너 동일 — 13장 참조)
```

---

## 3. 2단계 — GitHub 레포 생성 & Git 초기화

짐스캐너가 사용하는 org `anteam7` 아래에 신규 레포 생성.

```bash
cd C:/Web/healthpill

git init
git checkout -b main
git add .
git commit -m "chore: bootstrap healthpill (Next.js 16 + Supabase + Vercel)"

# GitHub CLI 로 레포 생성 (Private 권장 — 짐스캐너와 동일)
gh repo create anteam7/healthpill --private --source=. --remote=origin --push
```

CLI 가 없으면 GitHub 웹에서 `anteam7/healthpill` 빈 레포를 만든 뒤:

```bash
git remote add origin https://github.com/anteam7/healthpill
git push -u origin main
```

브랜치 전략은 짐스캐너와 동일 — `main` 단일 브랜치에 push 하면 Vercel 자동 배포.

---

## 4. 3단계 — Supabase 프로젝트 생성

신규 Supabase 프로젝트를 만든다 (짐스캐너 `obxvucyhzlakensopalf` 와 별도 — 데이터 격리).

1. https://supabase.com/dashboard 접속 → **New project**
2. 입력값
   - Name: `healthpill`
   - Database Password: 강력한 비밀번호 생성 (예: `Hp@<숫자><특수>` 패턴 — 1Password 등에 보관)
   - Region: **Northeast Asia (Seoul) — `ap-northeast-2`** (짐스캐너와 동일 — 응답 속도)
   - Plan: Free 시작 → 트래픽 발생 시 Pro 업그레이드
3. 프로젝트 생성 후 다음 값을 기록 (Settings → API)
   - **Project ref** (예: `xxxxxxxxxxxxxxxx`) — URL 의 서브도메인
   - **Project URL**: `https://<project-ref>.supabase.co`
   - **anon key** (public)
   - **service_role key** (secret — 서버 전용)

### 4-1. DB 직접 접속 (DDL 용)

짐스캐너 경험 — **직접 연결(5432) 은 IPv6 전용으로 한국 가정용 IPv4 회선에서 연결 안 됨**. 반드시 Connection Pooler(Supavisor) 사용:

```bash
PGPASSWORD='<DB 비밀번호>' psql \
  -h aws-0-ap-northeast-2.pooler.supabase.com \
  -p 6543 \
  -U "postgres.<project-ref>" \
  -d postgres
```

추가 주의 (짐스캐너 운영 함정 그대로 적용):

- Settings → Database → **Network Restrictions** 에 본인 공인 IP 추가 필요 (`1.230.239.17` 등 — 변경 시 재등록)
- 비밀번호에 특수문자가 있으면 URL 방식 대신 `PGPASSWORD` 환경변수로 전달
- `service_role key` 로는 DDL 불가 — REST API/PostgREST 만 가능

### 4-2. 신규 공개 테이블 생성 시 RLS 함정 (짐스캐너 메모리 `supabase_rls_anon_read.md`)

> **anon 키가 읽는 테이블에 RLS 만 켜고 SELECT 정책을 누락하면 조용히 0 rows 반환.**
> 새 공개 테이블마다 다음 둘 중 하나를 반드시 적용:
>
> ```sql
> -- 옵션 A: RLS off (정말 공개해도 되는 마스터 데이터)
> alter table public.<t> disable row level security;
>
> -- 옵션 B: RLS on + SELECT 정책 (안전한 디폴트)
> alter table public.<t> enable row level security;
> create policy "<t> read" on public.<t> for select to anon using (true);
> ```

---

## 5. 4단계 — Vercel 프로젝트 생성 & 환경변수 등록

### 5-1. Vercel 프로젝트 import

1. https://vercel.com 로그인 → **Add New → Project**
2. GitHub 계정에서 `anteam7/healthpill` 선택 → Import
3. Framework: **Next.js** 자동 감지 / Root: `./` / Build: `next build` (기본)
4. **Environment Variables** 단계에서 6장의 변수들을 모두 등록 (Production + Preview + Development)
5. Deploy

### 5-2. Vercel CLI 로 로컬 연결

짐스캐너에서 검증된 흐름 — `.vercel/project.json` 자동 생성, `.env.local` 동기화.

```bash
cd C:/Web/healthpill
npm i -g vercel        # 미설치 시
vercel login           # GitHub 계정으로 로그인
vercel link            # anseunghyoks-projects / healthpill 선택
vercel env pull .env.local   # 등록된 환경변수 → .env.local
```

> 짐스캐너 `.vercel/project.json` 참고:
> - `orgId`: `team_TgKadGwSrEXedzp4wSwXon34` (= `anseunghyoks-projects`)
> - 신규 healthpill 프로젝트는 별도 `projectId` 가 발급된다.

### 5-3. 도메인 연결

1. Vercel → Project → Settings → Domains → 사용 도메인 추가 (예: `www.healthpill.co.kr`)
2. 도메인 등록기관(가비아/후이즈 등) DNS 에 Vercel 안내 CNAME/A 레코드 등록
3. apex 도메인(`healthpill.co.kr`) 은 Vercel 가이드대로 A `76.76.21.21` 또는 ANAME 사용
4. SSL 자동 발급 확인 (`https://www.healthpill.co.kr` 200 응답)

---

## 6. 5단계 — 환경변수 정의 (`.env.local` & Vercel)

짐스캐너 `.env.local` 을 분석한 결과, 신규 사이트에서 **반드시 새로 발급/설정해야 할 키** 와 **재사용 가능한 키** 를 분류.

### 6-1. 신규 발급 필수 (healthpill 전용)

| 키 | 설명 | 발급 위치 |
|------|------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | 신규 Supabase URL | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 신규 Supabase anon key | 동일 |
| `SUPABASE_SERVICE_ROLE_KEY` | 신규 Supabase service_role | 동일 (절대 클라이언트 노출 금지) |
| `ADMIN_EMAILS` | `/admin` 화이트리스트. 다중 가능 콤마 구분 | 직접 정의 — 예: `anseunghyok@gmail.com` |
| `CRON_SECRET` | Vercel Cron `Authorization` 헤더 검증 | `openssl rand -hex 32` 로 신규 생성 |

### 6-2. 재사용 가능 (짐스캐너에서 이미 발급됨 — `memory/secrets.md` 에 보관)

| 키 | 비고 |
|------|------|
| `GEMINI_API_KEY` | Google AI Studio. healthpill 도 동일 키로 호출 가능. 무료 한도 공유됨 — 트래픽 늘면 별도 키 권장. 콘솔: https://aistudio.google.com/app/apikey |
| `ANTHROPIC_API_KEY` | 보류 상태 (크레딧 부족). 충전 시 사용. https://console.anthropic.com/ |
| `NAVER_OPENAPI_CLIENT_ID` / `NAVER_OPENAPI_CLIENT_SECRET` | 일 25,000회 한도. healthpill 키워드를 추가하더라도 짐스캐너와 합쳐 한도 내. 분리하려면 https://developers.naver.com/apps 에서 신규 앱 등록. |

### 6-3. 신규 발급 권장 (분석/콘솔)

| 키 | 설명 |
|------|------|
| `GA4_PROPERTY_ID` + Service Account JSON | 신규 GA4 property 만들고 서비스 계정에 Viewer 권한 부여. JSON 은 `ga4-key.json` 으로 두되 `.gitignore` 에 반드시 등록 (짐스캐너 패턴 그대로). |
| `GSC_SERVICE_ACCOUNT_JSON` | Google Search Console — 사이트 등록 후 서비스 계정에 Owner 권한. JSON 은 Vercel env 에 통째로 넣는다 (짐스캐너는 `GSC_SERVICE_ACCOUNT_JSON` 으로 등록됨). |

### 6-4. `.env.local` 템플릿

`C:\Web\healthpill\.env.local` (절대 git 커밋 금지):

```dotenv
# ── 관리자 ─────────────────────────────
ADMIN_EMAILS="anseunghyok@gmail.com"

# ── Supabase (healthpill 신규 프로젝트) ─
NEXT_PUBLIC_SUPABASE_URL="https://<healthpill-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<healthpill anon key>"
SUPABASE_SERVICE_ROLE_KEY="<healthpill service_role key>"

# ── Cron 보호 (신규 생성) ───────────────
CRON_SECRET="<openssl rand -hex 32>"

# ── AI (재사용 또는 신규) ────────────────
GEMINI_API_KEY="<재사용 또는 신규>"
# ANTHROPIC_API_KEY="<크레딧 충전 시>"

# ── 외부 API (필요 시) ───────────────────
NAVER_OPENAPI_CLIENT_ID=""
NAVER_OPENAPI_CLIENT_SECRET=""

# ── 분석 (필요 시) ───────────────────────
GA4_PROPERTY_ID=""
# GSC_SERVICE_ACCOUNT_JSON 은 Vercel env 에만 등록 (로컬에서는 별도 JSON 파일 사용)
```

### 6-5. `.gitignore` (짐스캐너 그대로 사용)

```gitignore
# Secret keys - never commit
*.key.json
ga4-key.json
gsc-key.json

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
.env*.local

# ephemeral script outputs
/scripts/out/

# 통관/PII 데이터 — healthpill 에서는 의약품 PII (있다면) 동일하게 차단
*.xlsx
*.xls
```

---

## 7. 6단계 — `next.config.ts` (이미지 호스트 허용)

짐스캐너 `next.config.ts` 를 healthpill 의 신규 Supabase 호스트로 수정:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "<healthpill-ref>.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
```

---

## 8. 7단계 — Supabase 클라이언트 (`src/lib/supabase.ts`)

짐스캐너 패턴 — anon 키는 브라우저용, service_role 은 서버 라우트 전용으로 분리.

```ts
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(url, anon, {
  auth: { persistSession: false },
});

export function supabaseService() {
  if (!service) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing");
  return createClient(url, service, { auth: { persistSession: false } });
}

export function supabaseSSR(cookies: () => { get(name: string): { value: string } | undefined }) {
  return createServerClient(url, anon, {
    cookies: {
      get: (n) => cookies().get(n)?.value,
    },
  });
}
```

---

## 9. 8단계 — `vercel.json` (Cron 정의 — 필요 시)

healthpill 이 데이터 수집/리프레시 잡을 가질 경우 `vercel.json` 작성. 짐스캐너 패턴 그대로 — 모든 cron 라우트는 `Authorization: Bearer ${CRON_SECRET}` 검증.

```json
{
  "crons": [
    { "path": "/api/cron/refresh-prices", "schedule": "0 18 * * *" },
    { "path": "/api/cron/collect-naver-news", "schedule": "10 18 * * *" }
  ]
}
```

각 cron 라우트 핸들러에서:

```ts
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("unauthorized", { status: 401 });
  }
  // ... 작업
}
```

> ⚠️ Hobby 플랜 cron 한도(개수·실행 빈도)에 주의. 짐스캐너는 7개 cron 으로 한도 안에 운영 중.

---

## 10. 9단계 — 초기 DB 스키마 템플릿 (`supabase/schema.sql`)

healthpill 도메인은 짐스캐너처럼 "비교 콘텐츠 + 어드민 + 시그널 수집" 패턴이 유효. 최소 셋:

```sql
-- ─────────────────────────────────────────────
-- 제품 카테고리 (마스터)
-- ─────────────────────────────────────────────
create table products (
  id uuid primary key default gen_random_uuid(),
  slug varchar(100) unique not null,
  name varchar(200) not null,
  category varchar(100),
  description text,
  ingredients text[],
  benefits text[],
  cautions text[],
  image_url varchar(300),
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- 가격 / 판매처 비교
-- ─────────────────────────────────────────────
create table product_prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  vendor varchar(100) not null,        -- 쿠팡, 아이허브 등
  vendor_url varchar(500),
  price_krw integer,
  price_usd numeric(8,2),
  shipping_krw integer default 0,
  in_stock boolean default true,
  fetched_at timestamptz default now()
);
create index idx_product_prices_product on product_prices(product_id);

-- ─────────────────────────────────────────────
-- 콘텐츠 (블로그/가이드)
-- ─────────────────────────────────────────────
create table contents (
  id uuid primary key default gen_random_uuid(),
  slug varchar(200) unique not null,
  title varchar(300) not null,
  body_md text,                         -- 마크다운 본문
  status varchar(20) default 'draft',   -- draft | review | published
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- 관리자 액션 로그 (admin_observability 패턴 그대로)
-- ─────────────────────────────────────────────
create table admin_actions (
  id bigserial primary key,
  actor_email varchar(200) not null,
  action varchar(80) not null,          -- 'create_product', 'publish_content' 등
  target_type varchar(50),
  target_id varchar(100),
  payload jsonb,
  created_at timestamptz default now()
);
create index idx_admin_actions_created on admin_actions(created_at desc);

-- ─────────────────────────────────────────────
-- 공개 테이블 RLS (5장 4-2 함정 회피)
-- ─────────────────────────────────────────────
alter table products         enable row level security;
alter table product_prices   enable row level security;
alter table contents         enable row level security;

create policy "products read"       on products       for select to anon using (is_active = true);
create policy "product_prices read" on product_prices for select to anon using (true);
create policy "contents read"       on contents       for select to anon using (status = 'published');

-- admin_actions 는 anon 차단 — service_role 만 INSERT/SELECT
alter table admin_actions enable row level security;
```

> 도메인이 바뀌면 테이블도 바뀐다 — healthpill 의 사업 방향이 확정되면 짐스캐너 `_audit/` 자료처럼 도메인 분석부터 시작해 스키마를 다시 그릴 것. 위는 골격.

---

## 11. 10단계 — 인증 / 어드민

짐스캐너는 Supabase Auth + 이메일 화이트리스트(`ADMIN_EMAILS`) 방식. healthpill 도 동일하게 가져갈 것.

1. Supabase → Authentication → Providers → Email enable, Magic Link 또는 비밀번호 사용
2. Supabase → Authentication → Users → 본인 계정 추가 (`anseunghyok@gmail.com`)
3. `/admin/*` 라우트 미들웨어에서:
   - 세션 유저 이메일을 `process.env.ADMIN_EMAILS.split(",")` 에 포함되는지 검사
   - 미포함이면 `redirect('/')`

> 짐스캐너 비밀번호 패턴: `An@<숫자>#<숫자>` — healthpill 은 별도 비밀번호로 분리 권장 (자격 증명 격리).

---

## 12. 11단계 — 분석/SEO 인프라 (선택)

짐스캐너에서 학습한 것:

- **GSC 등록 빠르게**: 서비스 계정 JSON 한 번 만들어 두면 `/admin/search-console` 같은 어드민 위젯에서 쿼리 가능. healthpill 도 도메인 verified 직후 등록.
- **GA4**: `@google-analytics/data` 로 서버에서 직접 조회. 페이지에는 GA4 측정 ID 만 심으면 됨.
- **`sitemap.ts` / `robots.ts`** 는 App Router 기본 패턴 그대로.
- **ISR 캐시 함정** (`memory/vercel_isr_revalidate.md`): `revalidatePath(path, 'layout')` 사용. `'page'` 기본값만으로는 Vercel Edge Cache purge 가 누락되는 사례가 있었음.

---

## 13. 12단계 — DDL 자동 적용 스크립트 (`scripts/apply-sql.mjs`)

짐스캐너 `db_migration_workflow.md` 메모 — DDL 은 사용자 승인 후 `scripts/apply-sql.mjs` 로 직접 실행. 핸드오프 금지. 동일 스크립트 패턴을 healthpill 에 복제:

```js
// scripts/apply-sql.mjs
import { readFileSync } from "node:fs";
import pg from "pg";

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/apply-sql.mjs <path-to-sql>");
  process.exit(1);
}

const sql = readFileSync(file, "utf8");

const client = new pg.Client({
  host: "aws-0-ap-northeast-2.pooler.supabase.com",
  port: 6543,
  user: `postgres.${process.env.SUPABASE_PROJECT_REF}`,
  password: process.env.PGPASSWORD,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  await client.query(sql);
  console.log("OK:", file);
} finally {
  await client.end();
}
```

실행:

```bash
SUPABASE_PROJECT_REF=<healthpill-ref> PGPASSWORD='<DB비번>' \
  node scripts/apply-sql.mjs supabase/schema.sql
```

> 사전에 Supabase Dashboard → Database → Network Restrictions 에서 본인 공인 IP 가 허용되어 있어야 한다. 짐스캐너 운영 시 이 한 가지로 자주 막힘.

---

## 14. 13단계 — 배포 / 검증 / 운영

```bash
# 1) 로컬 빌드 검증 (짐스캐너 규칙: 소스 변경 후 반드시)
npm run build

# 2) 커밋 & 배포
git add -A
git commit -m "feat: <변경 요약>"
git push origin main          # Vercel 자동 배포

# 3) Vercel 빌드 로그 확인 — 실패 시 즉시 fix-forward (amend 금지)
```

운영 체크리스트 (짐스캐너에서 검증된 항목):

- [ ] `/admin` 로그인 → 화이트리스트 동작 확인
- [ ] 공개 페이지에서 anon 으로 데이터 조회 (RLS 정책 통과 확인 — 0 rows 함정)
- [ ] `vercel.json` cron 이 정의되어 있다면 `/api/cron/...` 가 401 (Authorization 미스) 또는 200 으로 응답하는지 수동 호출
- [ ] `revalidatePath('/<pub>', 'layout')` 으로 캐시 무효화 동작 확인
- [ ] Supabase Network Restrictions 에 본인 IP 등록되어 있는지

---

## 15. 비용 / 한도 메모

| 서비스 | 플랜 | 비고 |
|--------|------|------|
| Vercel | Hobby (개인) → 트래픽/cron 늘면 Pro $20/월 | 짐스캐너는 현재 Hobby. healthpill 도 시작은 Hobby. |
| Supabase | Free → 트래픽 늘면 Pro $25/월 | DB 500MB / 대역폭 5GB 한도. healthpill 별도 프로젝트로 분리. |
| Google Gemini | 무료 한도 (RPM/일 제한) | 짐스캐너와 합산되므로 트래픽 발생 시 별도 키 발급 권장. |
| Naver OpenAPI | 일 25,000회 (검색 API) | 짐스캐너 사용량 1,200/일 수준 → 합산 여유. |
| 도메인 | `.co.kr` 약 22,000원/년 (가비아 기준) | 사이트 방향 결정 후 등록. |

---

## 16. 짐스캐너에서 가져올 / 가져오지 말아야 할 것

**가져올 것 (검증된 패턴):**
- `.gitignore`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs` 골격
- `src/lib/supabase.ts` 클라이언트 분리 패턴
- `scripts/apply-sql.mjs` DDL 적용 스크립트
- 어드민 화이트리스트 + `admin_actions` 로그 패턴
- Cron Authorization 헤더 검증 패턴
- 공개 테이블에 항상 RLS + SELECT 정책 페어로 적용

**가져오지 말 것:**
- 짐스캐너의 Supabase 프로젝트 키들 — healthpill 은 별도 프로젝트
- 도메인 특화 테이블 (`forwarders`, `centers`, `shipping_rates`, `manifest`, `recommend_simulator` 등)
- 통관 매니페스트/PII 처리 로직 — healthpill 도메인과 무관
- `platform_direction.md` 등 짐스캐너 기획 문서 (healthpill 별도 작성 필요)

---

## 17. 다음 단계 액션 아이템

1. healthpill 의 사업 방향(타깃 사용자 / 비즈니스 모델 / 핵심 기능) 정의 — 짐스캐너 `platform_direction.md` 같은 단일 진실원본 문서 작성
2. 위 0장의 도메인/Vercel/GitHub/Supabase 이름 확정
3. 2장 명령으로 로컬 부트스트랩 → 첫 빈 페이지 배포
4. 도메인 연결 + GA4 + GSC 등록
5. 10장 스키마 템플릿을 healthpill 도메인에 맞게 재설계 → `apply-sql.mjs` 실행
6. `/admin` 골격 (로그인 + admin_actions 로그) 구현
7. MVP 콘텐츠/데이터 1차 투입 → 측정 → 반복

---

> 이 문서는 짐스캐너의 검증된 구성을 기반으로 한 "출발선" 가이드. 실제 healthpill 의 사업 방향이 확정되면 도메인 모델·스키마·핵심 기능은 별도 설계 사이클이 필요하다.
