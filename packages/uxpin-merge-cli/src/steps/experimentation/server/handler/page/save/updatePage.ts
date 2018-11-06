import { cloneDeep, isArray, reduce } from 'lodash';
import { PageContent } from '../../../../../../common/types/PageData';
import { DeletedElements, PageIncrementalUpdate } from '../../../../../../common/types/PageIncrementalUpdate';
import { getPageContent } from '../../../common/page/content/getPageContent';
import { writePageContent } from '../../../common/page/content/writePageContent';

export async function updatePage(uxpinDirPath:string, changes:PageIncrementalUpdate):Promise<void> {
  const oldPage:PageContent = await getPageContent(uxpinDirPath);
  const updatedPage:PageContent = updateElements(oldPage, changes.changed_elements);
  const remainingUpdated:PageContent = removeElements(updatedPage, changes.deleted_elements);
  await writePageContent(uxpinDirPath, remainingUpdated);
}

function updateElements(oldPage:PageContent, changedElements:Partial<PageContent>):PageContent {
  const oldPageCopy:PageContent = cloneDeep(oldPage);
  return reduce(changedElements, (newContent, elementChanges, elementId) => {
    const oldElement:{ props:{} } = oldPageCopy[elementId] || { props: {} };
    newContent[elementId] = {
      ...oldElement,
      ...elementChanges,
      props: {
        ...oldElement.props,
        ...elementChanges.props,
      },
    };
    return newContent;
  }, oldPageCopy);
}

function removeElements(pageContent:PageContent, deleted:DeletedElements):PageContent {
  const removedElementIds:string[] = getElementIds(deleted);
  return reduce(pageContent, (newContent, element, elementId) => {
    if (!removedElementIds.includes(elementId)) {
      newContent[elementId] = element;
    }
    return newContent;
  }, {} as PageContent);
}

function getElementIds(deleted:DeletedElements):string[] {
  if (isArray(deleted)) {
    return [];
  }
  return Object.keys(deleted).filter((id) => deleted[id]);
}
