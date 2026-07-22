# template-vite-react

Vite + React 기반 사전과제 시작용 템플릿입니다.

이 템플릿은 라우팅, 폼 검증, API 요청, 서버 상태 관리, 전역 상태 관리 예제를 미리 포함하고 있습니다. 새로운 프로젝트를 시작할 때는 예제 코드를 그대로 제출하기보다, 과제 도메인에 맞게 라우트와 파일명을 치환하면서 필요한 패턴만 남기는 방식으로 사용하는 것을 권장합니다.

## 포함된 예제

- `/counter`: Zustand store를 사용한 전역 상태 관리 예제
- `/todos`: React Hook Form + Zod를 사용한 폼 검증 예제
- `/todos/:todoId`: React Router URL 파라미터 + TanStack Query + Axios API 요청 예제

## 새 과제 시작 순서

1. 과제 요구사항을 먼저 분류합니다.
   - 필요한 페이지와 라우트
   - 서버 API 사용 여부
   - 폼 검증 필요 여부
   - 전역 상태 필요 여부
   - 로딩, 에러, 빈 상태 처리 범위
   - README, 배포, 테스트 제출 요구사항

2. 프로젝트 기본 정보를 바꿉니다.
   - `package.json`의 `name`
   - `README.md`의 프로젝트명과 실행 설명
   - 필요하다면 `.env` 또는 `.env.example`

3. 예제 라우트를 과제 도메인 라우트로 교체합니다.

   예를 들어 상품 목록 과제라면 다음처럼 바꿀 수 있습니다.

   ```tsx
   <Route path="/" element={<ProductList />} />
   <Route path="/products/:productId" element={<ProductDetail />} />
   ```

4. API 타입과 요청 함수를 먼저 정리합니다.
   - 응답 타입은 `src/libs/types` 또는 기능별 파일에 정의합니다.
   - API 요청 함수는 `src/libs/apis` 또는 도메인별 API 파일로 분리합니다.
   - API base URL은 환경변수로 분리하는 것을 권장합니다.

5. TanStack Query hook을 작성합니다.
   - 목록 조회: `useProducts`
   - 상세 조회: `useProduct`
   - 생성, 수정, 삭제: mutation hook으로 분리

6. 페이지 UI를 구현합니다.
   - `pages`는 라우트 단위 화면을 담당합니다.
   - `components`는 재사용 가능한 UI를 담당합니다.
   - `hooks`는 데이터 조회나 화면 로직을 담당합니다.
   - `stores`는 여러 화면에서 공유되는 상태가 있을 때만 사용합니다.

7. 상태별 화면을 빠짐없이 처리합니다.
   - 로딩 상태
   - 에러 상태
   - 빈 데이터 상태
   - 잘못된 URL 파라미터
   - 폼 검증 실패

8. 제출 전 예제 코드를 정리합니다.
   - 과제와 무관한 `/counter`, `/todos` 예제는 제거하거나 실제 기능으로 치환합니다.
   - 화면 안 설명 UI가 평가 대상이 아니라면 README로 옮기고 실제 사용자 화면은 간결하게 유지합니다.

9. 제출 전 검증합니다.

   ```bash
   npm run lint
   npm run build
   ```

## 추천 폴더 구조

과제 규모가 작다면 현재 구조를 유지해도 충분합니다. 기능이 늘어나면 아래처럼 도메인 중심으로 정리할 수 있습니다.

```txt
src/
  pages/
    Home.tsx
    Products/
      index.tsx
      ProductDetail/
        index.tsx
  components/
    Button.tsx
    Input.tsx
    EmptyState.tsx
  hooks/
    useProducts.ts
    useProduct.ts
  stores/
    useFilterStore.ts
  libs/
    apis/
    types/
    utils/
```

## 기술 사용 기준

- `zustand`: 로그인 사용자, 필터, 장바구니, 모달 상태처럼 여러 화면에서 공유되는 값이 있을 때 사용합니다.
- `react-hook-form` + `zod`: 입력 폼과 검증 규칙이 있는 경우 사용합니다.
- `@tanstack/react-query`: 서버 API 조회, 캐싱, 로딩, 에러 상태가 필요한 경우 사용합니다.
- `axios`: API base URL, 공통 헤더, 에러 처리, 토큰 주입이 필요한 경우 래퍼로 관리합니다.
- `tailwindcss`: 페이지와 컴포넌트 스타일링에 사용합니다.

## README 작성 팁

사전과제 제출용 README에는 아래 내용을 정리하는 것이 좋습니다.

- 프로젝트 실행 방법
- 사용 기술
- 구현 기능
- 폴더 구조
- 주요 구현 의도
- 아쉬운 점 또는 개선 가능성
- 배포 URL이 있다면 배포 링크

## 실행 명령어

```bash
npm install
npm run dev
```

## 검증 명령어

```bash
npm run lint
npm run build
```
