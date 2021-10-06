import Image_0bae6227 from './0bae6227-b0c0-4685-8391-e6f2436a9a84.jpg';
import Image_2c77ddd4 from './2c77ddd4-83d5-41d4-a942-c23a218d91d8.jpg';
import Image_346306a1 from './346306a1-223b-4ad7-b7be-f761941ec6de.jpg';
import Image_6145483c from './6145483c-8f5d-4b00-b838-75c9855e9ba1.jpg';
import Image_65c9f1dc from './65c9f1dc-7582-418e-a202-c759cd69840e.jpg';
import Image_c2de8d03 from './c2de8d03-175a-41ed-9b9f-78bf3c65c227.jpg';
import Image_d15fd7e8 from './d15fd7e8-9420-4e6a-9b7b-022bb1e024ca.jpg';
import Image_e9516499 from './e9516499-a81a-43ac-92c8-b077af972715.jpg';

const Images: Partial<Record<string, StaticImageData>> = {
    '0bae6227-b0c0-4685-8391-e6f2436a9a84': Image_0bae6227,
    '2c77ddd4-83d5-41d4-a942-c23a218d91d8': Image_2c77ddd4,
    '346306a1-223b-4ad7-b7be-f761941ec6de': Image_346306a1,
    '6145483c-8f5d-4b00-b838-75c9855e9ba1': Image_6145483c,
    '65c9f1dc-7582-418e-a202-c759cd69840e': Image_65c9f1dc,
    'c2de8d03-175a-41ed-9b9f-78bf3c65c227': Image_c2de8d03,
    'd15fd7e8-9420-4e6a-9b7b-022bb1e024ca': Image_d15fd7e8,
    'e9516499-a81a-43ac-92c8-b077af972715': Image_e9516499
};

export function getImageForEntry(id: string) {
    return Images[id] ?? null;
}
