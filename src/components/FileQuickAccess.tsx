import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

interface FileItem {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'audio' | 'document';
  url: string;
  size: number;
  createdAt: string;
  category?: 'estimate' | 'note' | 'photo';
}

interface FileQuickAccessProps {
  files: FileItem[];
  onPreview: (file: FileItem) => void;
  onAnalyzeWithAI: (file: FileItem) => void;
  onDelete: (fileId: string) => void;
  sectionColor?: string;
}

// File type icon mapping
const FILE_ICONS: Record<string, string> = {
  pdf: '📄',
  image: '🖼️',
  audio: '🎵',
  document: '📝',
};

// Filter types
type FilterType = 'all' | 'estimates' | 'photos' | 'audio';

// File Item Component
const FileItemCard = ({
  file,
  onPress,
  onLongPress,
}: {
  file: FileItem;
  onPress: () => void;
  onLongPress: () => void;
}) => {
  const formattedDate = new Date(file.createdAt).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
  });

  const formattedSize =
    file.size < 1024
      ? `${file.size} B`
      : file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(1)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <TouchableOpacity
      style={styles.fileItem}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.fileIcon}>
        <Text style={styles.fileIconText}>{FILE_ICONS[file.type] || '📄'}</Text>
      </View>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={1}>
          {file.name}
        </Text>
        <Text style={styles.fileMeta}>
          {formattedSize} • {formattedDate}
        </Text>
      </View>
      {file.category === 'estimate' && (
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>Wycena</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Context Menu Modal
const ContextMenuModal = ({
  visible,
  file,
  onClose,
  onPreview,
  onAnalyze,
  onDelete,
  sectionColor,
}: {
  visible: boolean;
  file: FileItem | null;
  onClose: () => void;
  onPreview: () => void;
  onAnalyze: () => void;
  onDelete: () => void;
  sectionColor: string;
}) => {
  if (!file) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.contextMenu}>
          <View style={styles.contextMenuHeader}>
            <Text style={styles.contextMenuIcon}>
              {FILE_ICONS[file.type] || '📄'}
            </Text>
            <Text style={styles.contextMenuTitle} numberOfLines={1}>
              {file.name}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.contextMenuItem}
            onPress={() => {
              onPreview();
              onClose();
            }}
          >
            <Text style={styles.contextMenuItemIcon}>👁️</Text>
            <Text style={styles.contextMenuItemText}>Podgląd</Text>
          </TouchableOpacity>

          {file.type === 'pdf' && (
            <TouchableOpacity
              style={styles.contextMenuItem}
              onPress={() => {
                onAnalyze();
                onClose();
              }}
            >
              <Text style={styles.contextMenuItemIcon}>🤖</Text>
              <Text style={[styles.contextMenuItemText, { color: sectionColor }]}>
                Analiza AI
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.contextMenuItem, styles.contextMenuItemDanger]}
            onPress={() => {
              Alert.alert(
                'Usuń plik',
                `Czy na pewno chcesz usunąć "${file.name}"?`,
                [
                  { text: 'Anuluj', style: 'cancel' },
                  {
                    text: 'Usuń',
                    style: 'destructive',
                    onPress: () => {
                      onDelete();
                      onClose();
                    },
                  },
                ]
              );
            }}
          >
            <Text style={styles.contextMenuItemIcon}>🗑️</Text>
            <Text style={[styles.contextMenuItemText, { color: colors.status.error }]}>
              Usuń
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default function FileQuickAccess({
  files,
  onPreview,
  onAnalyzeWithAI,
  onDelete,
  sectionColor = colors.primary.main,
}: FileQuickAccessProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);

  // Filter files based on selected filter
  const filteredFiles = files.filter((file) => {
    switch (filter) {
      case 'estimates':
        return file.category === 'estimate' || file.type === 'pdf';
      case 'photos':
        return file.type === 'image';
      case 'audio':
        return file.type === 'audio';
      default:
        return true;
    }
  });

  // Count files by type
  const counts = {
    all: files.length,
    estimates: files.filter((f) => f.category === 'estimate' || f.type === 'pdf').length,
    photos: files.filter((f) => f.type === 'image').length,
    audio: files.filter((f) => f.type === 'audio').length,
  };

  const handleLongPress = (file: FileItem) => {
    setSelectedFile(file);
    setShowContextMenu(true);
  };

  const handlePreview = (file: FileItem) => {
    onPreview(file);
  };

  const FilterPill = ({
    type,
    label,
    count,
  }: {
    type: FilterType;
    label: string;
    count: number;
  }) => (
    <TouchableOpacity
      style={[
        styles.filterPill,
        filter === type && [styles.filterPillActive, { backgroundColor: sectionColor }],
      ]}
      onPress={() => setFilter(type)}
    >
      <Text
        style={[
          styles.filterPillText,
          filter === type && styles.filterPillTextActive,
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.filterPillCount,
          filter === type && styles.filterPillCountActive,
        ]}
      >
        <Text
          style={[
            styles.filterPillCountText,
            filter === type && styles.filterPillCountTextActive,
          ]}
        >
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (files.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateIcon}>📁</Text>
        <Text style={styles.emptyStateText}>Brak plików</Text>
        <Text style={styles.emptyStateSubtext}>
          Dodaj wyceny, zdjęcia lub nagrania audio
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FilterPill type="all" label="Wszystkie" count={counts.all} />
        <FilterPill type="estimates" label="Wyceny" count={counts.estimates} />
        <FilterPill type="photos" label="Zdjęcia" count={counts.photos} />
        <FilterPill type="audio" label="Audio" count={counts.audio} />
      </View>

      {/* Files List */}
      <FlatList
        data={filteredFiles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FileItemCard
            file={item}
            onPress={() => handlePreview(item)}
            onLongPress={() => handleLongPress(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>
              Brak plików w tej kategorii
            </Text>
          </View>
        }
      />

      {/* Hint */}
      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>
          Przytrzymaj plik, aby zobaczyć więcej opcji
        </Text>
      </View>

      {/* Context Menu Modal */}
      <ContextMenuModal
        visible={showContextMenu}
        file={selectedFile}
        onClose={() => setShowContextMenu(false)}
        onPreview={() => selectedFile && onPreview(selectedFile)}
        onAnalyze={() => selectedFile && onAnalyzeWithAI(selectedFile)}
        onDelete={() => selectedFile && onDelete(selectedFile.id)}
        sectionColor={sectionColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
    marginRight: spacing.xs,
  },
  filterPillActive: {
    backgroundColor: colors.primary.main,
  },
  filterPillText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  filterPillTextActive: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.medium,
  },
  filterPillCount: {
    marginLeft: spacing.xs,
    backgroundColor: colors.surface.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  filterPillCountActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterPillCountText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  filterPillCountTextActive: {
    color: colors.text.inverse,
  },
  listContent: {
    padding: spacing.md,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  fileIconText: {
    fontSize: 20,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  fileMeta: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  categoryBadge: {
    backgroundColor: colors.primary.main + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  categoryBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary.main,
    fontWeight: typography.fontWeight.medium,
  },
  noResults: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  hintContainer: {
    padding: spacing.md,
    alignItems: 'center',
  },
  hintText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyStateText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  contextMenu: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: 300,
    ...shadows.xl,
  },
  contextMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  contextMenuIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  contextMenuTitle: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  contextMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  contextMenuItemDanger: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  contextMenuItemIcon: {
    fontSize: 18,
    marginRight: spacing.md,
  },
  contextMenuItemText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
});
