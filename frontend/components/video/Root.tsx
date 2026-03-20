import { Composition } from 'remotion';
import { HostingComposition } from './Composition';

export const RemotionVideo: React.FC = () => {
    return (
        <>
            <Composition
                id="HostingShort"
                component={HostingComposition as any}
                durationInFrames={1800}
                fps={30}
                width={1080}
                height={1920}
                defaultProps={{
                    providerName: "Hostinger",
                    price: "2.99",
                    scenes: [
                        { speech: "Looking for high-speed cloud hosting?", visual: "Datacenter clip" },
                        { speech: "Hostinger offers 99.9% uptime and 24/7 support.", visual: "Support agent" }
                    ],
                    theme: 'glass' as const
                }}
            />
            <Composition
                id="HostingLandscape"
                component={HostingComposition as any}
                durationInFrames={1800}
                fps={30}
                width={1920}
                height={1080}
                defaultProps={{
                    providerName: "Hostinger",
                    price: "2.99",
                    scenes: [
                        { speech: "Power your website with Hostinger.", visual: "Speed gauges" }
                    ],
                    theme: 'glass' as const
                }}
            />
        </>
    );
};
