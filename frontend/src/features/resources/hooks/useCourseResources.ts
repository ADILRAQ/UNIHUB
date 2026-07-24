/**
 * Logic hook for the Resources tab of CoursePage.
 * Owns all state, mutations, and derived data for modules and their resources.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useGetData from '../../../hooks/useGetData';
import usePostData from '../../../hooks/usePostData';
import * as moduleService from '../services/moduleService';
import * as resourceService from '../services/resourceService';
import type {
  ModuleDto,
  ResourceDto,
  ResourceSearchResult,
  CreateModuleRequest,
  UpdateModuleRequest,
} from '../types';

interface UseCourseResourcesReturn {
  modules: ModuleDto[];
  isLoadingModules: boolean;
  isErrorModules: boolean;
  expandedModules: Set<number>;
  toggleModule: (id: number) => void;
  resourcesByModule: Record<number, ResourceDto[]>;
  createModule: (data: CreateModuleRequest) => void;
  isCreatingModule: boolean;
  updateModule: (moduleId: number, data: UpdateModuleRequest) => void;
  deleteModule: (moduleId: number) => void;
  uploadResource: (moduleId: number, file: File) => void;
  uploadingModuleId: number | null;
  deleteResource: (resourceId: number, moduleId: number) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: ResourceSearchResult[];
  isSearching: boolean;
  downloadResource: (resourceId: number, filename: string) => Promise<void>;
}

const useCourseResources = (courseId: number): UseCourseResourcesReturn => {
  const queryClient = useQueryClient();
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [resourcesByModule, setResourcesByModule] = useState<
    Record<number, ResourceDto[]>
  >({});
  const [searchQuery, setSearchQueryState] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [uploadingModuleId, setUploadingModuleId] = useState<number | null>(null);
  // ref to carry moduleId through delete mutation's onSuccessFn (void return)
  const pendingDeleteRef = useRef<{ resourceId: number; moduleId: number } | null>(null);

  const { data: modules, isLoading: isLoadingModules, isError: isErrorModules } =
    useGetData<ModuleDto[], string | number, ModuleDto[]>({
      queryKey: ['modules', courseId],
      queryFn: () => moduleService.getModules(courseId),
      transformFn: (d) => d,
    });

  const { data: searchResults, isLoading: isSearching } = useGetData<
    ResourceSearchResult[],
    string,
    ResourceSearchResult[]
  >({
    queryKey: ['resources', 'search', debouncedQuery],
    queryFn: () => resourceService.searchResources(debouncedQuery),
    transformFn: (d) => d,
    enabled: debouncedQuery.length > 0,
  });

  const setSearchQuery = useCallback((q: string) => {
    setSearchQueryState(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(q), 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const loadResources = useCallback(
    async (moduleId: number) => {
      if (resourcesByModule[moduleId] !== undefined) return;
      try {
        const data = await resourceService.getResources(moduleId);
        setResourcesByModule((prev) => ({ ...prev, [moduleId]: data }));
      } catch {
        // silently ignore — module panel shows empty list
      }
    },
    [resourcesByModule],
  );

  const toggleModule = useCallback(
    (id: number) => {
      setExpandedModules((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
          void loadResources(id);
        }
        return next;
      });
    },
    [loadResources],
  );

  const invalidateModules = () =>
    queryClient.invalidateQueries({ queryKey: ['modules', courseId] });

  const { mutate: createModuleMutate, isPending: isCreatingModule } = usePostData<
    string | number,
    { courseId: number; data: CreateModuleRequest },
    ModuleDto
  >({
    keys: ['modules', 'create'],
    serviceFn: ({ courseId: cId, data }) => moduleService.createModule(cId, data),
    onSuccessFn: () => {
      void invalidateModules();
    },
  });

  const { mutate: updateModuleMutate } = usePostData<
    string | number,
    { moduleId: number; data: UpdateModuleRequest },
    ModuleDto
  >({
    keys: ['modules', 'update'],
    serviceFn: ({ moduleId, data }) => moduleService.updateModule(moduleId, data),
    onSuccessFn: () => {
      void invalidateModules();
    },
  });

  const { mutate: deleteModuleMutate } = usePostData<string | number, number, void>({
    keys: ['modules', 'delete'],
    serviceFn: (moduleId) => moduleService.deleteModule(moduleId),
    onSuccessFn: () => {
      void invalidateModules();
    },
  });

  // Upload: ResourceDto comes back with moduleId on it, so onSuccessFn has everything needed.
  const { mutate: uploadMutate } = usePostData<
    string | number,
    { moduleId: number; file: File },
    ResourceDto
  >({
    keys: ['resources', 'upload'],
    serviceFn: ({ moduleId, file }) => resourceService.uploadResource(moduleId, file),
    onSuccessFn: (newResource) => {
      setResourcesByModule((prev) => ({
        ...prev,
        [newResource.moduleId]: [...(prev[newResource.moduleId] ?? []), newResource],
      }));
      setUploadingModuleId(null);
    },
    onErrorFn: () => {
      setUploadingModuleId(null);
    },
  });

  const uploadResource = useCallback(
    (moduleId: number, file: File) => {
      setUploadingModuleId(moduleId);
      uploadMutate({ moduleId, file });
    },
    [uploadMutate],
  );

  // Delete: void return, so use a ref to carry moduleId into the success callback.
  const { mutate: deleteResourceMutate } = usePostData<string | number, number, void>({
    keys: ['resources', 'delete'],
    serviceFn: (resourceId) => resourceService.deleteResource(resourceId),
    onSuccessFn: () => {
      const pending = pendingDeleteRef.current;
      if (pending) {
        setResourcesByModule((prev) => ({
          ...prev,
          [pending.moduleId]: (prev[pending.moduleId] ?? []).filter(
            (r) => r.id !== pending.resourceId,
          ),
        }));
        pendingDeleteRef.current = null;
      }
    },
  });

  const deleteResource = useCallback(
    (resourceId: number, moduleId: number) => {
      pendingDeleteRef.current = { resourceId, moduleId };
      deleteResourceMutate(resourceId);
    },
    [deleteResourceMutate],
  );

  return {
    modules: modules ?? [],
    isLoadingModules,
    isErrorModules,
    expandedModules,
    toggleModule,
    resourcesByModule,
    createModule: (data) => createModuleMutate({ courseId, data }),
    isCreatingModule,
    updateModule: (moduleId, data) => updateModuleMutate({ moduleId, data }),
    deleteModule: (moduleId) => deleteModuleMutate(moduleId),
    uploadResource,
    uploadingModuleId,
    deleteResource,
    searchQuery,
    setSearchQuery,
    searchResults: searchResults ?? [],
    isSearching,
    downloadResource: resourceService.downloadResource,
  };
};

export default useCourseResources;
