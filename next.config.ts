import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  
  images: {
    // 특정 도메인(예: 유저 프로필, 외부 서비스)의 이미지를 허용할 때 사용합니다.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // 모든 도메인을 허용하려면 '**'를 사용 (보안상 운영 단계에선 특정 도메인 권장)
        port: '',
        pathname: '/**',
      },
    ],
    // 만약 보안을 위해 특정 도메인만 지정하고 싶다면 아래와 같이 작성하세요.
    /*
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // 예시: 언스플래쉬 도메인
        pathname: '/**',
      },
    ],
    */
  },
};

export default nextConfig;